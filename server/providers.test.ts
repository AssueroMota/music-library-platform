import { randomUUID } from 'node:crypto'
import { afterEach, expect, it, vi } from 'vitest'
import { configSchema } from './config.js'
import { createProviders } from './providers.js'

const config = configSchema.parse({
  DATABASE_URL: 'postgresql://localhost/unit-test-only',
  MERCADO_PAGO_ACCESS_TOKEN: 'unit-test-placeholder-never-sent-to-network',
  MERCADO_PAGO_WEBHOOK_SECRET: 'unit-test-webhook-placeholder',
  MERCADO_PAGO_SELLER_ID: '123456',
  SUPABASE_URL: 'https://auth.example.test',
  SUPABASE_SERVICE_ROLE_KEY: 'unit-test-placeholder',
  RESEND_API_KEY: 'unit-test-placeholder',
  EMAIL_FROM: 'Music Library <sender@example.test>',
  SUPPORT_EMAIL: 'support@example.test',
  FRONTEND_URL: 'https://library.example.test',
  BACKEND_URL: 'https://api.example.test',
  EMAIL_LINK_ENCRYPTION_KEY: 'a'.repeat(64),
})
afterEach(() => vi.unstubAllGlobals())

it('executa o SDK oficial com contrato Orders e chave estável, sem campos de Preferences', async () => {
  const fetchMock = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          id: 'ORDTST123',
          user_id: '123456',
          currency: 'BRL',
          checkout_url: 'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=ORDTST123',
        }),
        { status: 201 },
      ),
  )
  vi.stubGlobal('fetch', fetchMock)
  const provider = createProviders(config)
  const id = randomUUID()
  const result = await provider.createOrder({
    id,
    productCode: 'ML-VIOLIN',
    productName: 'Biblioteca de Violino',
    priceCents: 1790,
  })
  expect(result.id).toBe('ORDTST123')
  const [url, options] = vi.mocked(fetch).mock.calls[0]
  expect(url).toBe('https://api.mercadopago.com/v1/orders')
  expect(new Headers(options?.headers).get('X-Idempotency-Key')).toBe(id)
  const body = JSON.parse(options?.body as string)
  expect(body).toMatchObject({
    type: 'online',
    processing_mode: 'manual',
    total_amount: '17.90',
    external_reference: id,
    items: [{ external_code: 'ML-VIOLIN', unit_price: '17.90', quantity: 1 }],
    config: {
      online: {
        success_url: `https://library.example.test/checkout/success?order=${id}`,
        auto_return: 'all',
      },
    },
  })
  expect(body).not.toHaveProperty('back_urls')
  expect(body).not.toHaveProperty('notification_url')
})

it('consulta Orders pelo SDK e valida a resposta do provedor', async () => {
  const fetchMock = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          id: 'ORDTST123',
          type: 'online',
          processing_mode: 'manual',
          external_reference: randomUUID(),
          user_id: 123456,
          currency: 'BRL',
          total_amount: '17.90',
          status: 'created',
          status_detail: 'created',
          last_updated_date: new Date().toISOString(),
          items: [{ external_code: 'ML-VIOLIN', quantity: 1, unit_price: '17.90' }],
        }),
      ),
  )
  vi.stubGlobal('fetch', fetchMock)
  expect((await createProviders(config).getOrder('ORDTST123')).user_id).toBe('123456')
  expect(vi.mocked(fetch).mock.calls[0][0]).toBe('https://api.mercadopago.com/v1/orders/ORDTST123')
})

it('não aceita checkout de outra conta recebedora', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            id: 'ORDTST123',
            user_id: '999',
            currency: 'BRL',
            checkout_url: 'https://www.mercadopago.com.br/checkout/v1/redirect',
          }),
        ),
    ),
  )
  await expect(
    createProviders(config).createOrder({
      id: randomUUID(),
      productCode: 'ML-VIOLIN',
      productName: 'Violino',
      priceCents: 1790,
    }),
  ).rejects.toThrow('CHECKOUT_ACCOUNT_MISMATCH')
})

it('usa o SDK do Resend com e-mail profissional e idempotência', async () => {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: randomUUID() })))
  vi.stubGlobal('fetch', fetchMock)
  await createProviders(config).sendConfirmation(
    'buyer@example.test',
    'Biblioteca de Violino',
    'https://auth.example.test/verify?token=unit-test',
    'purchase/unit-test',
  )
  const [url, options] = vi.mocked(fetch).mock.calls[0]
  expect(url).toBe('https://api.resend.com/emails')
  expect(new Headers(options?.headers).get('Idempotency-Key')).toBe('purchase/unit-test')
  const body = JSON.parse(options?.body as string)
  expect(body.subject).toBe('Seu acesso à Music Library está pronto!')
  expect(body.html).toContain('Acessar minha biblioteca')
  expect(body.text).toContain('Biblioteca de Violino')
})
