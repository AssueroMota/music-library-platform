import { randomUUID } from 'node:crypto'
import { Prisma, PrismaClient, type Order, type OrderStatus } from '@prisma/client'
import { z } from 'zod'
import type { Config } from './config.js'
import type { Providers, RemoteOrder } from './providers.js'
import { personalLibraryLink } from './library-access.js'
import {
  AppError,
  checkToken,
  decryptLink,
  encryptLink,
  hashToken,
  paymentUrl,
} from './security.js'

export const deliveryEmailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254))
export const checkoutSchema = z
  .object({ productId: z.string().min(1).max(80), email: deliveryEmailSchema })
  .strict()
export const uuidSchema = z.uuid()
export const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/)

export function cents(value: string | undefined) {
  if (!value || !/^\d+(\.\d{1,2})?$/.test(value)) throw new Error('INVALID_AMOUNT')
  const [whole, fraction = ''] = value.split('.')
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  if (!Number.isSafeInteger(amount)) throw new Error('INVALID_AMOUNT')
  return amount
}

function statusOf(remote: RemoteOrder): OrderStatus {
  if (
    remote.status === 'charged_back' ||
    remote.transactions?.chargebacks?.some((c) => c.status !== 'reversed')
  )
    return 'CHARGED_BACK'
  // Conservative policy: a partial refund also suspends the entitlement from this purchase.
  if (
    remote.status === 'refunded' ||
    remote.status_detail === 'partially_refunded' ||
    remote.transactions?.refunds?.some((r) => r.status === 'approved' || r.status === 'processed')
  )
    return 'REFUNDED'
  if (remote.status === 'processed' && remote.status_detail === 'accredited') return 'APPROVED'
  if (remote.status === 'failed') return 'REJECTED'
  if (remote.status === 'canceled') return 'CANCELED'
  return 'PENDING'
}

export function verifyOrder(remote: RemoteOrder, order: Order, config: Config) {
  if (
    remote.id !== order.providerOrderId ||
    remote.external_reference !== order.id ||
    remote.user_id !== config.MERCADO_PAGO_SELLER_ID ||
    remote.currency !== order.currency ||
    remote.id.startsWith('ORDTST') !== (config.MERCADO_PAGO_MODE === 'test') ||
    cents(remote.total_amount) !== order.priceCents ||
    remote.items.length !== 1 ||
    remote.items[0].external_code !== order.productCode ||
    remote.items[0].quantity !== 1 ||
    cents(remote.items[0].unit_price) !== order.priceCents
  )
    throw new Error('PAYMENT_MISMATCH')
  const status = statusOf(remote)
  if (status === 'APPROVED') {
    const payments =
      remote.transactions?.payments.filter(
        (p) => p.status === 'processed' && p.status_detail === 'accredited',
      ) ?? []
    if (
      cents(remote.total_paid_amount) !== order.priceCents ||
      payments.reduce((sum, p) => sum + cents(p.paid_amount), 0) !== order.priceCents ||
      payments.some((p) => cents(p.amount) !== cents(p.paid_amount))
    )
      throw new Error('PAYMENT_NOT_SETTLED')
  }
  return status
}

const revoked = (status: OrderStatus) => ['REFUNDED', 'CHARGED_BACK'].includes(status)

export class CheckoutService {
  constructor(
    public db: PrismaClient,
    public providers: Providers,
    public config: Config,
  ) {}

  async checkout(productId: string, key: string, token: string, email: string) {
    const deliveryEmail = deliveryEmailSchema.parse(email)
    if (!this.config.CHECKOUT_ENABLED)
      throw new AppError(
        503,
        'CHECKOUT_UNAVAILABLE',
        'As compras ainda não estão disponíveis. Tente novamente mais tarde.',
      )
    const order = await this.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`
      const existing = await tx.order.findUnique({ where: { idempotencyKey: key } })
      if (existing) {
        if (
          existing.productId !== productId ||
          existing.deliveryEmail !== deliveryEmail ||
          !checkToken(token, existing.statusTokenHash)
        )
          throw new AppError(409, 'CHECKOUT_CONFLICT', 'Inicie uma nova tentativa de compra.')
        return existing
      }
      const product = await tx.product.findUnique({ where: { id: productId } })
      if (!product?.available || product.priceCents <= 0 || product.currency !== 'BRL')
        throw new AppError(409, 'PRODUCT_UNAVAILABLE', 'Este produto está indisponível no momento.')
      return tx.order.create({
        data: {
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          priceCents: product.priceCents,
          currency: product.currency,
          idempotencyKey: key,
          statusTokenHash: hashToken(token),
          deliveryEmail,
        },
      })
    })
    return this.db.$transaction(
      async (tx) => {
        const locked = await this.lockOrder(tx, order.id)
        if (locked.status !== 'PENDING')
          throw new AppError(
            409,
            'ORDER_FINISHED',
            'Este pedido já foi finalizado. Inicie uma nova compra.',
          )
        if (Date.now() - locked.createdAt.getTime() > 23 * 3600_000)
          throw new AppError(
            409,
            'ORDER_EXPIRED',
            'Esta tentativa expirou. Inicie uma nova compra.',
          )
        if (locked.checkoutUrl) return { orderId: locked.id, checkoutUrl: locked.checkoutUrl }
        const remote = await this.providers.createOrder({
          id: locked.id,
          productCode: locked.productCode,
          productName: locked.productName,
          priceCents: locked.priceCents,
          email: deliveryEmail,
        })
        const checkoutUrl = paymentUrl(remote.checkoutUrl)
        await tx.order.update({
          where: { id: locked.id },
          data: { providerOrderId: remote.id, checkoutUrl },
        })
        return { orderId: locked.id, checkoutUrl }
      },
      { timeout: 20000 },
    )
  }

  private async lockOrder(tx: Prisma.TransactionClient, id: string) {
    await tx.$queryRaw`SELECT id FROM orders WHERE id = ${id}::uuid FOR UPDATE`
    const order = await tx.order.findUnique({ where: { id } })
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Pedido não encontrado.')
    return order
  }

  async receiveWebhook(resourceId: string, deliveryKey: string) {
    // Persist before acknowledging. The body cannot approve a payment or change its identity.
    await this.db.$transaction(async (tx) => {
      await tx.webhookEvent.upsert({
        where: { id: deliveryKey },
        update: {},
        create: { id: deliveryKey, providerOrderId: resourceId },
      })
      await tx.job.upsert({
        where: { id: `webhook:${deliveryKey}` },
        update: {},
        create: { id: `webhook:${deliveryKey}`, kind: 'RECONCILE', resourceId },
      })
    })
  }

  async reconcile(resourceId: string) {
    const local = await this.db.order.findUnique({ where: { providerOrderId: resourceId } })
    // Includes the rare webhook-before-checkout-commit race; the durable job will retry.
    if (!local) throw new Error('ORDER_NOT_LINKED')
    await this.db.$transaction(
      async (tx) => {
        const order = await this.lockOrder(tx, local.id)
        // Read fresh provider state under the row lock, never the webhook payload.
        const remote = await this.providers.getOrder(resourceId)
        const next = verifyOrder(remote, order, this.config)
        const timestamp = new Date(remote.last_updated_date)
        if (order.providerUpdatedAt && timestamp < order.providerUpdatedAt) return
        if (revoked(order.status) && !revoked(next)) return
        if (order.status === 'APPROVED' && ['PENDING', 'REJECTED', 'CANCELED'].includes(next))
          return
        if (order.buyerEmail && remote.payer?.email && order.buyerEmail !== remote.payer.email)
          throw new Error('BUYER_MISMATCH')
        for (const payment of remote.transactions?.payments ?? []) {
          const existing = await tx.payment.findUnique({ where: { id: payment.id } })
          if (existing && existing.orderId !== order.id) throw new Error('PAYMENT_ALREADY_LINKED')
          await tx.payment.upsert({
            where: { id: payment.id },
            create: {
              id: payment.id,
              orderId: order.id,
              status: payment.status,
              statusDetail: payment.status_detail,
              amountCents: cents(payment.amount),
            },
            update: {
              status: payment.status,
              statusDetail: payment.status_detail,
              amountCents: cents(payment.amount),
            },
          })
        }
        await tx.order.update({
          where: { id: order.id },
          data: { status: next, providerUpdatedAt: timestamp, buyerEmail: remote.payer?.email },
        })
        if (revoked(next) || next === 'CANCELED' || next === 'REJECTED') {
          await tx.entitlement.updateMany({
            where: { orderId: order.id, revokedAt: null },
            data: { revokedAt: new Date() },
          })
          await tx.order.update({ where: { id: order.id }, data: { emailLinkCiphertext: null } })
        }
        if (next === 'APPROVED')
          await tx.job.upsert({
            where: { id: `fulfill:${order.id}` },
            update: {},
            create: { id: `fulfill:${order.id}`, kind: 'FULFILL', resourceId: order.id },
          })
      },
      { timeout: 20000 },
    )
  }

  async fulfill(orderId: string) {
    await this.db.$transaction(
      async (tx) => {
        const order = await this.lockOrder(tx, orderId)
        if (order.status !== 'APPROVED' || order.accessGrantedAt) return
        const email = order.deliveryEmail ?? order.buyerEmail
        if (!email) throw new Error('BUYER_EMAIL_MISSING')
        const login = await this.providers.createLogin(email)
        if (login.email !== email) throw new Error('AUTH_EMAIL_MISMATCH')
        const user = await tx.user.upsert({
          where: { id: login.userId },
          create: { id: login.userId, email: login.email },
          update: { email: login.email },
        })
        await tx.entitlement.upsert({
          where: { orderId },
          update: {},
          create: { orderId, userId: user.id, productId: order.productId },
        })
        const personalLink = await personalLibraryLink(
          tx,
          user.id,
          this.config.FRONTEND_URL,
          this.config.EMAIL_LINK_ENCRYPTION_KEY,
        )
        await tx.order.update({
          where: { id: orderId },
          data: {
            userId: user.id,
            accessGrantedAt: new Date(),
            emailLinkCiphertext: encryptLink(personalLink, this.config.EMAIL_LINK_ENCRYPTION_KEY),
          },
        })
      },
      { timeout: 20000 },
    )
    // An email failure cannot roll back access. Retries reuse the exact payload/key.
    await this.db.$transaction(
      async (tx) => {
        const order = await this.lockOrder(tx, orderId)
        if (order.status !== 'APPROVED' || order.emailSentAt) return
        const email = order.deliveryEmail ?? order.buyerEmail
        if (!order.accessGrantedAt || !email || !order.emailLinkCiphertext)
          throw new Error('ACCESS_NOT_READY')
        const link = decryptLink(order.emailLinkCiphertext, this.config.EMAIL_LINK_ENCRYPTION_KEY)
        await this.providers.sendConfirmation(
          email,
          order.productName,
          link,
          `purchase/${order.id}`,
        )
        await tx.order.update({
          where: { id: orderId },
          data: { emailSentAt: new Date(), emailLinkCiphertext: null },
        })
      },
      { timeout: 20000 },
    )
  }

  async status(id: string, token: string) {
    const order = await this.db.order.findUnique({ where: { id }, include: { entitlement: true } })
    if (!order || !checkToken(token, order.statusTokenHash))
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Pedido não encontrado neste navegador.')
    return {
      orderId: order.id,
      productName: order.productName,
      priceCents: order.priceCents,
      checkoutUrl:
        order.status === 'PENDING' && Date.now() - order.createdAt.getTime() < 23 * 3600000
          ? order.checkoutUrl
          : null,
      status: order.status,
      accessReady:
        order.status === 'APPROVED' && Boolean(order.entitlement && !order.entitlement.revokedAt),
      emailSent: Boolean(order.emailSentAt),
    }
  }

  async runJobs(limit = 10) {
    let processed = 0
    while (processed < limit) {
      const lease = randomUUID()
      const job = await this.db.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<
          { id: string }[]
        >`SELECT id FROM jobs WHERE "doneAt" IS NULL AND "availableAt" <= NOW() AND ("lockedUntil" IS NULL OR "lockedUntil" < NOW()) ORDER BY "availableAt" FOR UPDATE SKIP LOCKED LIMIT 1`
        if (!rows[0]) return null
        return tx.job.update({
          where: { id: rows[0].id },
          data: {
            leaseToken: lease,
            lockedUntil: new Date(Date.now() + 120000),
            attempts: { increment: 1 },
          },
        })
      })
      if (!job) break
      try {
        if (job.kind === 'RECONCILE') await this.reconcile(job.resourceId)
        else await this.fulfill(job.resourceId)
        await this.db.job.updateMany({
          where: { id: job.id, leaseToken: lease },
          data: { doneAt: new Date(), lockedUntil: null, leaseToken: null, lastError: null },
        })
      } catch {
        await this.db.job.updateMany({
          where: { id: job.id, leaseToken: lease },
          data: {
            lockedUntil: null,
            leaseToken: null,
            lastError: 'PROCESSING_FAILED',
            availableAt: new Date(
              Date.now() + Math.min(3600, 2 ** Math.min(job.attempts, 11)) * 1000,
            ),
          },
        })
      }
      processed++
    }
    return processed
  }
}
