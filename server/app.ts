import Fastify, { LogController } from 'fastify'
import { randomUUID } from 'node:crypto'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { z, ZodError } from 'zod'
import { CheckoutService, checkoutSchema, tokenSchema, uuidSchema } from './service.js'
import { AppError, hashToken, validateSignature } from './security.js'

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
    products: await service.db.product.findMany({
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
    }),
  }))
  app.post(
    '/api/checkout',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const { productId } = checkoutSchema.parse(request.body)
      const key = uuidSchema.parse(request.headers['idempotency-key'])
      const token = tokenSchema.parse(request.headers['x-checkout-token'])
      return reply.code(201).send(await service.checkout(productId, key, token))
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
        include: { entitlements: { where: { revokedAt: null }, take: 1 } },
      })
      if (user?.entitlements.length) {
        const login = await service.providers.createLogin(email)
        if (login.userId !== user.id || login.email !== user.email)
          throw new Error('AUTH_USER_MISMATCH')
        await service.providers.sendLogin(email, login.link, `login/${randomUUID()}`)
      }
      return reply.code(202).send({
        message: 'Se houver uma compra liberada para este e-mail, você receberá um link de acesso.',
      })
    },
  )
  app.get('/api/library', async (request) => {
    const user = await authenticate(request.headers.authorization)
    const rights = await service.db.entitlement.findMany({
      where: { userId: user.id, revokedAt: null, order: { status: 'APPROVED' } },
      include: { product: true },
    })
    const complete = rights.some((r) => r.product.accessType === 'COMPLETE')
    const instruments = rights.flatMap((r) => (r.product.instrument ? [r.product.instrument] : []))
    const assets = rights.length
      ? await service.db.libraryAsset.findMany({
          where: complete ? {} : { instrument: { in: instruments } },
          select: { id: true, title: true, kind: true, instrument: true },
          orderBy: { title: 'asc' },
        })
      : []
    return {
      products: [
        ...new Map(
          rights.map((r) => [r.productId, { id: r.productId, name: r.product.name }]),
        ).values(),
      ],
      assets,
    }
  })
  app.get('/api/library/assets/:id/download', async (request) => {
    const user = await authenticate(request.headers.authorization)
    const { id } = z.object({ id: uuidSchema }).parse(request.params)
    const asset = await service.db.libraryAsset.findUnique({ where: { id } })
    if (!asset) throw new AppError(404, 'NOT_FOUND', 'Arquivo não encontrado.')
    const right = await service.db.entitlement.findFirst({
      where: {
        userId: user.id,
        revokedAt: null,
        order: { status: 'APPROVED' },
        product: {
          OR: [
            { accessType: 'COMPLETE' },
            { accessType: 'INSTRUMENT', instrument: asset.instrument },
          ],
        },
      },
    })
    if (!right)
      throw new AppError(403, 'ACCESS_DENIED', 'Este material não faz parte dos seus acessos.')
    return { url: await service.providers.signedDownload(asset.storageKey) }
  })
  return app
}
