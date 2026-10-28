import type { Prisma } from '@prisma/client'
import { violinPriceCents } from '../shared/violin-launch.js'
import { AppError } from './security.js'

// Only approved, active Basic purchases fund an upgrade. Never trust a browser credit.
export async function upgradeOffer(
  db: Pick<Prisma.TransactionClient, 'entitlement' | 'product' | 'order'>,
  userId: string,
) {
  const rights = await db.entitlement.findMany({
    where: { userId, revokedAt: null, order: { status: 'APPROVED' } },
    include: { product: true, order: true },
  })
  if (
    rights.some(
      ({ product }) =>
        product.accessType === 'COMPLETE' ||
        (product.accessType === 'INSTRUMENT' && product.instrument === 'violin'),
    )
  )
    return { alreadyComplete: true as const }
  const sources = rights
    .filter(({ product }) => product.accessType === 'SCORES' && product.instrument === 'violin')
    .sort((a, b) => b.order.priceCents - a.order.priceCents)
  if (!sources.length)
    throw new AppError(
      403,
      'UPGRADE_NOT_AVAILABLE',
      'O upgrade está disponível para quem possui o Plano Básico ativo.',
    )
  const [product, pending] = await Promise.all([
    db.product.findUnique({ where: { id: 'library-violin-playbacks' } }),
    db.order.findFirst({
      where: {
        userId,
        upgradeFromOrderId: { in: sources.map((source) => source.orderId) },
        OR: [
          { status: 'PENDING', createdAt: { gt: new Date(Date.now() - 23 * 3600000) } },
          { status: 'APPROVED' },
        ],
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])
  if (
    !product ||
    product.currency !== 'BRL' ||
    product.accessType !== 'INSTRUMENT' ||
    product.instrument !== 'violin'
  )
    throw new AppError(409, 'PRODUCT_UNAVAILABLE', 'O upgrade está indisponível no momento.')
  if (pending?.status === 'APPROVED')
    throw new AppError(
      409,
      'UPGRADE_PROCESSING',
      'Seu upgrade foi pago e está sendo liberado. Atualize seu acesso em alguns instantes; não faça outro pagamento.',
    )
  const source =
    (pending && sources.find((source) => source.orderId === pending.upgradeFromOrderId)) ||
    sources[0]
  const creditCents = source.order.priceCents
  const completePriceCents = pending
    ? pending.priceCents + creditCents
    : violinPriceCents(product.id, product.priceCents)
  const priceCents = pending?.priceCents ?? completePriceCents - creditCents
  if (priceCents <= 0)
    throw new AppError(
      409,
      'UPGRADE_NO_BALANCE',
      'O valor pago já cobre o Completo. Entre em contato com o suporte para ajustar seu acesso sem nova cobrança.',
    )
  return {
    alreadyComplete: false as const,
    product,
    sourceOrderId: source.orderId,
    creditCents,
    completePriceCents,
    priceCents,
    pending,
  }
}
