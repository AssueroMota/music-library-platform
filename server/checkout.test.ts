import { createHmac, randomUUID } from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, beforeEach, describe, expect, inject, it, vi } from 'vitest'
import { catalog } from '../shared/products.js'
import { CheckoutService } from './service.js'
import { createApp } from './app.js'
import type { Config } from './config.js'
import type { Providers, RemoteOrder } from './providers.js'
import { confirmationEmail } from './email.js'

const config = {
  CHECKOUT_ENABLED: true,
  MERCADO_PAGO_MODE: 'test',
  MERCADO_PAGO_SELLER_ID: '123456',
  MERCADO_PAGO_WEBHOOK_SECRET: 'test-webhook-secret-for-local-tests',
  EMAIL_LINK_ENCRYPTION_KEY: '1'.repeat(64),
  FRONTEND_URL: 'http://localhost:5173',
} as Config
const userId = '11111111-1111-4111-8111-111111111111'
const buyerEmail = 'buyer@example.test'
const providers: Providers = {
  createOrder: vi.fn(async ({ id }) => ({
    id: `ORDTST${id.replaceAll('-', '').toUpperCase()}`,
    checkoutUrl: 'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=ORDTST123',
  })),
  getOrder: vi.fn(),
  createLogin: vi.fn(async (email) => ({
    userId,
    email,
    link: 'https://auth.example.test/verify?token=secret-local-test',
  })),
  sendConfirmation: vi.fn(async () => {}),
  sendLogin: vi.fn(async () => {}),
  authenticate: vi.fn(async () => ({ id: userId, email: buyerEmail })),
  signedDownload: vi.fn(async () => 'https://storage.example.test/signed'),
  signedView: vi.fn(async () => 'https://storage.example.test/inline'),
}
let db: PrismaClient
let service: CheckoutService
let app: ReturnType<typeof createApp>
beforeAll(async () => {
  db = new PrismaClient({ datasourceUrl: inject('databaseUrl') })
  service = new CheckoutService(db, providers, config)
  app = createApp(service, false)
  await app.ready()
})
beforeEach(async () => {
  vi.clearAllMocks()
  config.CHECKOUT_ENABLED = true
  await db.$executeRawUnsafe(
    'TRUNCATE entitlements, payments, orders, users, products, webhook_events, jobs, library_assets CASCADE',
  )
  await db.product.createMany({
    data: catalog.map((p) => ({
      ...p,
      description: p.name,
      available: true,
      accessType: p.instrument ? 'INSTRUMENT' : 'COMPLETE',
    })),
  })
})
afterAll(async () => {
  await app?.close()
  await db?.$disconnect()
})

async function checkout(productId = 'library-violin', key = randomUUID(), token = 'a'.repeat(64)) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/checkout',
    headers: { 'idempotency-key': key, 'x-checkout-token': token },
    payload: { productId },
  })
  return {
    response,
    key,
    token,
    order: await db.order.findUnique({ where: { idempotencyKey: key } }),
  }
}
function remote(
  order: NonNullable<Awaited<ReturnType<typeof checkout>>['order']>,
  status = 'processed',
  detail = 'accredited',
): RemoteOrder {
  return {
    id: order.providerOrderId!,
    type: 'online',
    processing_mode: 'manual',
    external_reference: order.id,
    user_id: '123456',
    currency: 'BRL',
    total_amount: (order.priceCents / 100).toFixed(2),
    total_paid_amount: (order.priceCents / 100).toFixed(2),
    status,
    status_detail: detail,
    last_updated_date: new Date().toISOString(),
    payer: { email: buyerEmail },
    items: [
      {
        external_code: order.productCode,
        quantity: 1,
        unit_price: (order.priceCents / 100).toFixed(2),
      },
    ],
    transactions: {
      payments: [
        {
          id: `PAY${order.id}`,
          amount: (order.priceCents / 100).toFixed(2),
          paid_amount: (order.priceCents / 100).toFixed(2),
          status,
          status_detail: detail,
        },
      ],
    },
  }
}
async function notify(resourceId: string, requestId = randomUUID(), invalid = false) {
  const ts = Date.now().toString()
  const digest = createHmac('sha256', config.MERCADO_PAGO_WEBHOOK_SECRET)
    .update(`id:${resourceId.toLowerCase()};request-id:${requestId};ts:${ts};`)
    .digest('hex')
  return app.inject({
    method: 'POST',
    url: `/api/webhooks/mercadopago?data.id=${resourceId}&type=order`,
    headers: {
      'x-signature': `ts=${ts},v1=${invalid ? '0'.repeat(64) : digest}`,
      'x-request-id': requestId,
    },
    payload: { type: 'order', data: { id: resourceId }, status: 'processed' },
  })
}

describe('checkout e persistência real em PostgreSQL', () => {
  it('usa preço do banco, cria um pedido e reaproveita a mesma tentativa concorrente', async () => {
    await db.product.update({ where: { id: 'library-violin' }, data: { priceCents: 1990 } })
    const key = randomUUID()
    const results = await Promise.all([
      checkout('library-violin', key),
      checkout('library-violin', key),
    ])
    expect(results.map((r) => r.response.statusCode)).toEqual([201, 201])
    expect(await db.order.count()).toBe(1)
    expect(providers.createOrder).toHaveBeenCalledTimes(1)
    expect(providers.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ priceCents: 1990 }),
    )
    expect(results[0].response.json().checkoutUrl).toMatch(
      /^https:\/\/www.mercadopago.com.br\/checkout\//,
    )
  })
  it('rejeita preço enviado pelo cliente e não cria pedido', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/checkout',
      payload: { productId: 'library-violin', price: 0.01 },
    })
    expect(res.statusCode).toBe(400)
    expect(await db.order.count()).toBe(0)
  })
  it('bloqueia produto indisponível e checkout desabilitado', async () => {
    await db.product.update({ where: { id: 'library-violin' }, data: { available: false } })
    expect((await checkout()).response.statusCode).toBe(409)
    config.CHECKOUT_ENABLED = false
    expect((await checkout('library-complete')).response.statusCode).toBe(503)
    expect(providers.createOrder).not.toHaveBeenCalled()
  })
  it('mantém pedido pendente se o provedor falha e permite repetir a mesma tentativa', async () => {
    vi.mocked(providers.createOrder).mockRejectedValueOnce(new Error('network error with secret'))
    const first = await checkout()
    expect(first.response.statusCode).toBe(503)
    expect(first.response.body).not.toContain('secret')
    expect(first.order?.status).toBe('PENDING')
    expect((await checkout('library-violin', first.key, first.token)).response.statusCode).toBe(201)
    expect(await db.order.count()).toBe(1)
  })
  it('não permite consultar pedido sem seu token e ignora status da URL', async () => {
    const { order } = await checkout()
    const denied = await app.inject({
      url: `/api/orders/${order!.id}`,
      headers: { 'x-checkout-token': 'b'.repeat(64) },
    })
    expect(denied.statusCode).toBe(404)
    const actual = await app.inject({
      url: `/api/orders/${order!.id}?status=approved`,
      headers: { 'x-checkout-token': 'a'.repeat(64) },
    })
    expect(actual.json()).toMatchObject({ status: 'PENDING', accessReady: false })
    expect(actual.body).not.toContain('buyerEmail')
  })
})

describe('webhooks, confirmação e liberação', () => {
  it('deduplica a mesma entrega persistida antes e depois do processamento', async () => {
    const { order } = await checkout()
    vi.mocked(providers.getOrder).mockResolvedValue(remote(order!))
    await service.receiveWebhook(order!.providerOrderId!, 'same-signed-delivery')
    await service.receiveWebhook(order!.providerOrderId!, 'same-signed-delivery')
    await service.runJobs()
    await service.receiveWebhook(order!.providerOrderId!, 'same-signed-delivery')
    await service.runJobs()
    expect(await db.webhookEvent.count()).toBe(1)
    expect(await db.entitlement.count()).toBe(1)
    expect(providers.sendConfirmation).toHaveBeenCalledTimes(1)
  })
  it.each([
    ['processing', 'in_process', 'PENDING'],
    ['failed', 'rejected_by_issuer', 'REJECTED'],
    ['canceled', 'canceled', 'CANCELED'],
  ])('processa %s sem conceder acesso', async (status, detail, expected) => {
    const { order } = await checkout()
    vi.mocked(providers.getOrder).mockResolvedValue(remote(order!, status, detail))
    expect((await notify(order!.providerOrderId!)).statusCode).toBe(200)
    await service.runJobs()
    expect((await db.order.findUniqueOrThrow({ where: { id: order!.id } })).status).toBe(expected)
    expect(await db.entitlement.count()).toBe(0)
    expect(providers.sendConfirmation).not.toHaveBeenCalled()
  })
  it('valida a assinatura antes de persistir ou consultar o provedor', async () => {
    const { order } = await checkout()
    expect((await notify(order!.providerOrderId!, randomUUID(), true)).statusCode).toBe(401)
    expect(await db.webhookEvent.count()).toBe(0)
    expect(providers.getOrder).not.toHaveBeenCalled()
  })
  it('rejeita troca do ID no corpo e usa exclusivamente o recurso assinado', async () => {
    const id = 'ORDTST123'
    const requestId = randomUUID(),
      ts = Date.now().toString()
    const digest = createHmac('sha256', config.MERCADO_PAGO_WEBHOOK_SECRET)
      .update(`id:${id.toLowerCase()};request-id:${requestId};ts:${ts};`)
      .digest('hex')
    const res = await app.inject({
      method: 'POST',
      url: `/api/webhooks/mercadopago?data.id=${id}`,
      headers: { 'x-request-id': requestId, 'x-signature': `ts=${ts},v1=${digest}` },
      payload: { type: 'order', data: { id: 'ORDTSTDIFFERENT' } },
    })
    expect(res.statusCode).toBe(400)
  })
  it('concede acesso e envia um único e-mail com notificações duplicadas e workers concorrentes', async () => {
    const { order } = await checkout()
    vi.mocked(providers.getOrder).mockResolvedValue(remote(order!))
    await Promise.all([notify(order!.providerOrderId!), notify(order!.providerOrderId!)])
    await Promise.all([service.runJobs(), service.runJobs()])
    await service.runJobs()
    expect(await db.entitlement.count()).toBe(1)
    expect(await db.payment.count()).toBe(1)
    expect(await db.user.count()).toBe(1)
    expect(providers.sendConfirmation).toHaveBeenCalledTimes(1)
    expect(providers.sendConfirmation).toHaveBeenCalledWith(
      buyerEmail,
      'Biblioteca de Violino',
      expect.stringContaining('verify?token='),
      `purchase/${order!.id}`,
    )
    const actual = await service.status(order!.id, 'a'.repeat(64))
    expect(actual).toMatchObject({ status: 'APPROVED', accessReady: true, emailSent: true })
    expect(
      (await db.order.findUniqueOrThrow({ where: { id: order!.id } })).emailLinkCiphertext,
    ).toBeNull()
  })
  it.each(['amount', 'currency', 'product', 'seller', 'reference', 'paidAmount'])(
    'bloqueia confirmação incompatível: %s',
    async (field) => {
      const { order } = await checkout()
      const snapshot = remote(order!)
      if (field === 'amount') snapshot.total_amount = '0.01'
      if (field === 'currency') Object.assign(snapshot, { currency: 'USD' })
      if (field === 'product') snapshot.items[0].external_code = 'DIFFERENT'
      if (field === 'seller') snapshot.user_id = '999'
      if (field === 'reference') snapshot.external_reference = randomUUID()
      if (field === 'paidAmount') snapshot.total_paid_amount = '0.01'
      vi.mocked(providers.getOrder).mockResolvedValue(snapshot)
      await expect(service.reconcile(order!.providerOrderId!)).rejects.toThrow()
      expect(await db.entitlement.count()).toBe(0)
      expect((await db.order.findUniqueOrThrow({ where: { id: order!.id } })).status).toBe(
        'PENDING',
      )
    },
  )
  it('mantém acesso após falha de e-mail e faz nova tentativa com o mesmo link e chave', async () => {
    const { order } = await checkout()
    vi.mocked(providers.getOrder).mockResolvedValue(remote(order!))
    vi.mocked(providers.sendConfirmation).mockRejectedValueOnce(new Error('resend down'))
    await service.reconcile(order!.providerOrderId!)
    await service.runJobs()
    expect(await db.entitlement.count()).toBe(1)
    expect((await service.status(order!.id, 'a'.repeat(64))).emailSent).toBe(false)
    const pending = await db.order.findUniqueOrThrow({ where: { id: order!.id } })
    expect(pending.emailLinkCiphertext).not.toContain('verify?token=')
    await db.job.updateMany({ data: { availableAt: new Date(0) } })
    await service.runJobs()
    expect(providers.createLogin).toHaveBeenCalledTimes(1)
    expect(providers.sendConfirmation).toHaveBeenCalledTimes(2)
    expect(vi.mocked(providers.sendConfirmation).mock.calls[0]).toEqual(
      vi.mocked(providers.sendConfirmation).mock.calls[1],
    )
    expect((await service.status(order!.id, 'a'.repeat(64))).emailSent).toBe(true)
  })
  it('reutiliza conta existente para novos produtos', async () => {
    await db.user.create({ data: { id: userId, email: buyerEmail } })
    for (const product of ['library-violin', 'library-complete']) {
      const { order } = await checkout(product)
      vi.mocked(providers.getOrder).mockResolvedValue(remote(order!))
      await service.reconcile(order!.providerOrderId!)
      await service.runJobs()
    }
    expect(await db.user.count()).toBe(1)
    expect(await db.entitlement.count({ where: { userId } })).toBe(2)
  })
  it.each([
    ['refunded', 'refunded'],
    ['processed', 'partially_refunded'],
    ['charged_back', 'charged_back'],
  ])('revoga o acesso após %s/%s e não reativa com evento antigo', async (status, detail) => {
    const { order } = await checkout()
    const approved = remote(order!)
    vi.mocked(providers.getOrder).mockResolvedValue(approved)
    await service.reconcile(order!.providerOrderId!)
    await service.runJobs()
    const refund = {
      ...remote(order!, status, detail),
      last_updated_date: new Date(Date.now() + 1000).toISOString(),
    }
    vi.mocked(providers.getOrder).mockResolvedValue(refund)
    await service.reconcile(order!.providerOrderId!)
    expect((await db.entitlement.findFirstOrThrow()).revokedAt).not.toBeNull()
    vi.mocked(providers.getOrder).mockResolvedValue(approved)
    await service.reconcile(order!.providerOrderId!)
    expect((await service.status(order!.id, 'a'.repeat(64))).accessReady).toBe(false)
    const library = await app.inject({
      url: '/api/library',
      headers: { authorization: 'Bearer valid-test-session' },
    })
    expect(library.json().products).toEqual([])
  })
  it('protege download e visualização, filtra materiais e aplica revogação', async () => {
    const { order } = await checkout()
    vi.mocked(providers.getOrder).mockResolvedValue(remote(order!))
    await service.reconcile(order!.providerOrderId!)
    await service.runJobs()
    const violin = await db.libraryAsset.create({
      data: {
        title: 'Partitura',
        songTitle: 'Fix You',
        artist: 'Coldplay',
        style: 'Pop internacional',
        instrument: 'violin',
        kind: 'score',
        storageKey: 'violin/test.pdf',
      },
    })
    const cello = await db.libraryAsset.create({
      data: {
        title: 'Outra partitura',
        instrument: 'cello',
        kind: 'score',
        storageKey: 'cello/test.pdf',
      },
    })
    const headers = { authorization: 'Bearer valid-test-session' }
    expect((await app.inject({ url: '/api/library' })).statusCode).toBe(401)
    const library = await app.inject({ url: '/api/library', headers })
    expect(library.json().assets).toEqual([
      {
        id: violin.id,
        title: 'Partitura',
        songTitle: 'Fix You',
        artist: 'Coldplay',
        style: 'Pop internacional',
        instrument: 'violin',
        kind: 'score',
        format: 'pdf',
      },
    ])
    expect(library.body).not.toContain('storageKey')
    for (const action of ['download', 'view']) {
      expect(
        (await app.inject({ url: `/api/library/assets/${violin.id}/${action}` })).statusCode,
      ).toBe(401)
      expect(
        (await app.inject({ url: `/api/library/assets/${cello.id}/${action}`, headers }))
          .statusCode,
      ).toBe(403)
      expect(
        (await app.inject({ url: `/api/library/assets/${violin.id}/${action}`, headers }))
          .statusCode,
      ).toBe(200)
    }
    expect(providers.signedView).toHaveBeenCalledWith('violin/test.pdf')
    vi.mocked(providers.getOrder).mockResolvedValue(remote(order!, 'refunded', 'refunded'))
    await service.reconcile(order!.providerOrderId!)
    expect(
      (await app.inject({ url: `/api/library/assets/${violin.id}/download`, headers })).statusCode,
    ).toBe(403)
    expect(
      (await app.inject({ url: `/api/library/assets/${violin.id}/view`, headers })).statusCode,
    ).toBe(403)
  })
  it('não regride um aprovado para pendente com notificação fora de ordem', async () => {
    const { order } = await checkout()
    vi.mocked(providers.getOrder).mockResolvedValue(remote(order!))
    await service.reconcile(order!.providerOrderId!)
    vi.mocked(providers.getOrder).mockResolvedValue({
      ...remote(order!, 'processing', 'in_process'),
      last_updated_date: new Date(Date.now() + 1000).toISOString(),
    })
    await service.reconcile(order!.providerOrderId!)
    expect((await service.status(order!.id, 'a'.repeat(64))).status).toBe('APPROVED')
  })
  it('retorna a mesma resposta de login para e-mail desconhecido', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/link',
      payload: { email: 'unknown@example.test' },
    })
    expect(res.statusCode).toBe(202)
    expect(providers.createLogin).not.toHaveBeenCalled()
  })
  it('permite acesso de teste somente à pessoa e ao instrumento liberados, sem compras', async () => {
    await db.user.create({ data: { id: userId, email: buyerEmail } })
    await db.libraryPreviewAccess.create({
      data: {
        userId,
        instrument: 'violin',
        expiresAt: new Date(Date.now() + 3600000),
      },
    })
    const own = await db.libraryAsset.create({
      data: {
        title: 'Fix You',
        instrument: 'violin',
        kind: 'score',
        storageKey: 'violin/fix-you.png',
      },
    })
    const other = await db.libraryAsset.create({
      data: {
        title: 'Outra partitura',
        instrument: 'cello',
        kind: 'score',
        storageKey: 'cello/test.pdf',
      },
    })
    const headers = { authorization: 'Bearer valid-test-session' }
    const library = await app.inject({ url: '/api/library', headers })
    expect(library.statusCode).toBe(200)
    expect(library.json().assets.map((asset: { id: string }) => asset.id)).toEqual([own.id])
    expect(library.json().previewAccess).toEqual([
      { instrument: 'violin', expiresAt: expect.any(String) },
    ])
    expect(library.json().products).toEqual([])
    for (const action of ['view', 'download']) {
      expect(
        (await app.inject({ url: `/api/library/assets/${own.id}/${action}`, headers })).statusCode,
      ).toBe(200)
      expect(
        (await app.inject({ url: `/api/library/assets/${other.id}/${action}`, headers }))
          .statusCode,
      ).toBe(403)
      expect(
        (await app.inject({ url: `/api/library/assets/${own.id}/${action}` })).statusCode,
      ).toBe(401)
    }
    vi.mocked(providers.authenticate).mockResolvedValueOnce({
      id: randomUUID(),
      email: 'someone@example.test',
    })
    expect(
      (await app.inject({ url: `/api/library/assets/${own.id}/view`, headers })).statusCode,
    ).toBe(403)
    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/link',
      payload: { email: buyerEmail },
    })
    expect(login.statusCode).toBe(202)
    expect(providers.sendLogin).toHaveBeenCalledWith(
      buyerEmail,
      expect.any(String),
      expect.stringMatching(/^login\//),
    )
    expect(await db.order.count()).toBe(0)
    expect(await db.entitlement.count()).toBe(0)
    expect(providers.sendConfirmation).not.toHaveBeenCalled()
  })
  it.each(['expired', 'revoked'])(
    'nega biblioteca, arquivos e envio de link após acesso de teste %s',
    async (state) => {
      await db.user.create({ data: { id: userId, email: buyerEmail } })
      await db.libraryPreviewAccess.create({
        data: {
          userId,
          instrument: 'violin',
          createdAt: new Date(Date.now() - 7200000),
          expiresAt: new Date(Date.now() + (state === 'expired' ? -60000 : 3600000)),
          revokedAt: state === 'revoked' ? new Date() : null,
        },
      })
      const asset = await db.libraryAsset.create({
        data: {
          title: 'Teste',
          instrument: 'violin',
          kind: 'score',
          storageKey: 'violin/test.png',
        },
      })
      const headers = { authorization: 'Bearer valid-test-session' }
      const library = await app.inject({ url: '/api/library', headers })
      expect(library.json().assets).toEqual([])
      expect(library.json().previewAccess).toEqual([])
      expect(
        (await app.inject({ url: `/api/library/assets/${asset.id}/view`, headers })).statusCode,
      ).toBe(403)
      expect(
        (await app.inject({ url: `/api/library/assets/${asset.id}/download`, headers })).statusCode,
      ).toBe(403)
      await app.inject({ method: 'POST', url: '/api/auth/link', payload: { email: buyerEmail } })
      expect(providers.createLogin).not.toHaveBeenCalled()
      expect(providers.signedView).not.toHaveBeenCalled()
      expect(providers.signedDownload).not.toHaveBeenCalled()
    },
  )
  it('escapa conteúdo no template de confirmação', () => {
    const email = confirmationEmail(
      '<img src=x onerror=alert(1)>',
      'https://auth.example.test/?a=1&b=2',
      'support@example.test',
    )
    expect(email.html).not.toContain('<img')
    expect(email.html).toContain('Acessar minha biblioteca')
    expect(email.text).toContain('https://auth.example.test/')
  })
})
