import Fastify, { LogController } from 'fastify'
import { randomUUID } from 'node:crypto'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { z, ZodError } from 'zod'
import { CheckoutService, checkoutSchema, tokenSchema, uuidSchema } from './service.js'
import { AppError, checkToken, hashToken, validateSignature } from './security.js'
import { libraryFileFormat } from '../shared/library.js'
import { personalLibraryLink } from './library-access.js'
import { violinOffers } from '../shared/products.js'
import { violinPriceCents } from '../shared/violin-launch.js'
import type { Prisma } from '@prisma/client'

export function createApp(service: CheckoutService, logging = true) {
  const app = Fastify({
    bodyLimit: 32768,
    logController: new LogController({ disableRequestLogging: true }),
    // Do not serialize requests, query strings, tokens, provider errors or buyer data.
    logger: logging
      ? {
          level: 'info',
          serializers: {
            req: () => ({}),
            res: () => ({}),
            err: () => ({ type: 'Error', message: 'Request failed', stack: '' }),
          },
        }
      : false,
  })
  app.register(cors, {
    origin: service.config.FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Checkout-Token'],
  })
  app.register(rateLimit, { max: 120, timeWindow: '1 minute' })
  app.addHook('onSend', async (_req, reply, payload) => {
    reply
      .header('Cache-Control', 'no-store')
      .header('X-Content-Type-Options', 'nosniff')
      .header('Referrer-Policy', 'no-referrer')
    return payload
  })
  app.setErrorHandler((error: Error, request, reply) => {
    if (error instanceof ZodError)
      return reply
        .code(400)
        .send({ code: 'INVALID_INPUT', message: 'Verifique os dados e tente novamente.' })
    if (error instanceof AppError)
      return reply.code(error.statusCode).send({ code: error.code, message: error.message })
    const code =
      'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 503
    if (code >= 500)
      app.log.error(
        { requestId: request.id, code: 'REQUEST_FAILED' },
        'Falha ao processar solicitação',
      )
    return reply.code(code).send({
      code: code === 429 ? 'RATE_LIMITED' : 'SERVICE_UNAVAILABLE',
      message:
        code === 429
          ? 'Aguarde um momento antes de tentar novamente.'
          : 'Serviço indisponível no momento. Tente novamente em instantes.',
    })
  })

  app.get('/api/health', async () => {
    await service.db.$queryRaw`SELECT 1`
    return { ok: true }
  })
  app.get('/api/products', async () => ({
    checkoutEnabled: service.config.CHECKOUT_ENABLED,
    products: (
      await service.db.product.findMany({
        where: { id: { in: violinOffers.map((offer) => offer.id) } },
        select: {
          id: true,
          name: true,
          description: true,
          priceCents: true,
          currency: true,
          available: true,
          accessType: true,
          instrument: true,
        },
      })
    ).map((product) => ({
      ...product,
      priceCents: violinPriceCents(product.id, product.priceCents),
    })),
  }))
  app.post(
    '/api/checkout',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const { productId, email, expectedPriceCents } = checkoutSchema.parse(request.body)
      const key = uuidSchema.parse(request.headers['idempotency-key'])
      const token = tokenSchema.parse(request.headers['x-checkout-token'])
      return reply
        .code(201)
        .send(await service.checkout(productId, key, token, email, expectedPriceCents))
    },
  )
  app.get('/api/orders/:id', async (request) => {
    const { id } = z.object({ id: uuidSchema }).parse(request.params)
    const token = tokenSchema.parse(request.headers['x-checkout-token'])
    return service.status(id, token)
  })
  app.post(
    '/api/webhooks/mercadopago',
    { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } },
    async (request) => {
      const query = z
        .object({
          'data.id': z.string().regex(/^ORD[A-Z0-9]+$/i),
          type: z.literal('order').optional(),
        })
        .parse(request.query)
      const signature = z.string().parse(request.headers['x-signature'])
      const requestId = z.string().parse(request.headers['x-request-id'])
      const resourceId = query['data.id'].toUpperCase()
      validateSignature(
        signature,
        requestId,
        query['data.id'],
        service.config.MERCADO_PAGO_WEBHOOK_SECRET,
      )
      const body = z
        .object({ type: z.literal('order'), data: z.object({ id: z.string() }) })
        .parse(request.body)
      if (body.data.id.toUpperCase() !== resourceId)
        throw new AppError(400, 'RESOURCE_MISMATCH', 'Recurso inválido.')
      await service.receiveWebhook(resourceId, hashToken(`${requestId}:${signature}:${resourceId}`))
      return { received: true }
    },
  )

  async function authenticate(header: string | undefined) {
    if (!header?.startsWith('Bearer '))
      throw new AppError(401, 'LOGIN_REQUIRED', 'Entre para acessar sua biblioteca.')
    const user = await service.providers.authenticate(header.slice(7))
    if (!user) throw new AppError(401, 'LOGIN_REQUIRED', 'Sua sessão expirou. Entre novamente.')
    return user
  }
  app.get('/api/library/upgrade', async (request) => {
    const user = await authenticate(request.headers.authorization)
    return service.upgradeQuote(user)
  })
  app.post(
    '/api/library/upgrade',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      const user = await authenticate(request.headers.authorization)
      const { expectedPriceCents } = z
        .object({ expectedPriceCents: z.number().int().positive() })
        .strict()
        .parse(request.body)
      const key = uuidSchema.parse(request.headers['idempotency-key'])
      const token = tokenSchema.parse(request.headers['x-checkout-token'])
      return reply.code(201).send(await service.upgrade(user, key, token, expectedPriceCents))
    },
  )
  app.post(
    '/api/auth/link',
    { config: { rateLimit: { max: 3, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const { email } = z
        .object({ email: z.email().transform((s) => s.trim().toLowerCase()) })
        .strict()
        .parse(request.body)
      const user = await service.db.user.findUnique({
        where: { email },
        include: {
          entitlements: { where: { revokedAt: null, order: { status: 'APPROVED' } }, take: 1 },
          previewAccess: { where: { revokedAt: null, expiresAt: { gt: new Date() } }, take: 1 },
        },
      })
      if (user && (user.entitlements.length || user.previewAccess.length)) {
        const link = await personalLibraryLink(
          service.db,
          user.id,
          service.config.FRONTEND_URL,
          service.config.EMAIL_LINK_ENCRYPTION_KEY,
        )
        await service.providers.sendLogin(email, link, `login/${randomUUID()}`)
      }
      return reply.code(202).send({
        message: 'Se houver acesso liberado para este e-mail, você receberá um link de acesso.',
      })
    },
  )
  app.post(
    '/api/auth/access',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request) => {
      const { id, token } = z
        .object({ id: uuidSchema, token: tokenSchema })
        .strict()
        .parse(request.body)
      const link = await service.db.libraryAccessLink.findUnique({
        where: { id },
        include: {
          user: {
            include: {
              entitlements: { where: { revokedAt: null, order: { status: 'APPROVED' } }, take: 1 },
              previewAccess: { where: { revokedAt: null, expiresAt: { gt: new Date() } }, take: 1 },
            },
          },
        },
      })
      if (
        !link ||
        !checkToken(token, link.secretHash) ||
        (!link.user.entitlements.length && !link.user.previewAccess.length)
      )
        throw new AppError(
          403,
          'ACCESS_LINK_UNAVAILABLE',
          'Este link não está disponível. Solicite seu link novamente ou entre em contato com o suporte.',
        )
      const header = request.headers.authorization
      if (header?.startsWith('Bearer ')) {
        const current = await service.providers.authenticate(header.slice(7))
        if (current?.id === link.userId && current.email === link.user.email)
          return { authenticated: true as const }
      }
      const login = await service.providers.createLogin(link.user.email)
      if (login.userId !== link.userId || login.email !== link.user.email)
        throw new Error('AUTH_USER_MISMATCH')
      return { url: login.link }
    },
  )
  app.get('/api/library', async (request) => {
    const user = await authenticate(request.headers.authorization)
    const [rights, previews] = await Promise.all([
      service.db.entitlement.findMany({
        where: { userId: user.id, revokedAt: null, order: { status: 'APPROVED' } },
        include: { product: true },
      }),
      service.db.libraryPreviewAccess.findMany({
        where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
        select: { instrument: true, expiresAt: true },
      }),
    ])
    const complete = rights.some((r) => r.product.accessType === 'COMPLETE')
    const instruments = [
      ...new Set([
        ...rights.flatMap((r) => (r.product.instrument ? [r.product.instrument] : [])),
        ...previews.map((preview) => preview.instrument),
      ]),
    ]
    const scopes: Prisma.LibraryAssetWhereInput[] = [
      ...rights.flatMap(({ product }): Prisma.LibraryAssetWhereInput[] => {
        if (product.accessType === 'COMPLETE') return [{}]
        if (product.accessType === 'INSTRUMENT' && product.instrument)
          return [{ instrument: product.instrument }]
        if (product.accessType === 'SCORES' && product.instrument)
          return [{ instrument: product.instrument, kind: 'score' }]
        return []
      }),
      ...previews.map(({ instrument }) => ({ instrument })),
    ]
    const assets =
      complete || instruments.length
        ? await service.db.libraryAsset.findMany({
            where: { OR: scopes },
            select: {
              id: true,
              title: true,
              songTitle: true,
              artist: true,
              style: true,
              kind: true,
              instrument: true,
              storageKey: true,
            },
            orderBy: { title: 'asc' },
          })
        : []
    return {
      setlistLimit:
        rights.some(({ product }) => product.accessType !== 'SCORES') || previews.length ? 42 : 10,
      products: [
        ...new Map(
          rights.map((r) => [r.productId, { id: r.productId, name: r.product.name }]),
        ).values(),
      ],
      assets: assets.map(({ storageKey, ...asset }) => ({
        ...asset,
        format: libraryFileFormat(storageKey),
      })),
      previewAccess: previews,
      personalLink:
        complete || instruments.length
          ? await personalLibraryLink(
              service.db,
              user.id,
              service.config.FRONTEND_URL,
              service.config.EMAIL_LINK_ENCRYPTION_KEY,
            )
          : null,
    }
  })
  async function authorizedAsset(header: string | undefined, params: unknown) {
    const user = await authenticate(header)
    const { id } = z.object({ id: uuidSchema }).parse(params)
    const asset = await service.db.libraryAsset.findUnique({ where: { id } })
    if (!asset) throw new AppError(404, 'NOT_FOUND', 'Arquivo não encontrado.')
    const [right, preview] = await Promise.all([
      service.db.entitlement.findFirst({
        where: {
          userId: user.id,
          revokedAt: null,
          order: { status: 'APPROVED' },
          product: {
            OR: [
              { accessType: 'COMPLETE' },
              { accessType: 'INSTRUMENT', instrument: asset.instrument },
              ...(asset.kind === 'score'
                ? [{ accessType: 'SCORES', instrument: asset.instrument }]
                : []),
            ],
          },
        },
      }),
      service.db.libraryPreviewAccess.findFirst({
        where: {
          userId: user.id,
          instrument: asset.instrument,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      }),
    ])
    if (!right && !preview)
      throw new AppError(403, 'ACCESS_DENIED', 'Este material não faz parte dos seus acessos.')
    return asset
  }
  app.get('/api/library/assets/:id/download', async (request) => {
    const asset = await authorizedAsset(request.headers.authorization, request.params)
    return { url: await service.providers.signedDownload(asset.storageKey) }
  })
  app.get('/api/library/assets/:id/view', async (request) => {
    const asset = await authorizedAsset(request.headers.authorization, request.params)
    return { url: await service.providers.signedView(asset.storageKey) }
  })
  return app
}
