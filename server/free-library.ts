import { randomUUID } from 'node:crypto'
import type { CheckoutService } from './service.js'
import { deliveryEmailSchema } from './service.js'
import { personalLibraryLink } from './library-access.js'
import { librarySnapshot } from './library-queries.js'
import { encryptLink, decryptLink, AppError } from './security.js'

export async function requestFreeLibrary(service: CheckoutService, value: unknown) {
  const email = deliveryEmailSchema.parse(value)
  // Generating a login creates/reuses the Supabase identity; it sends no email itself.
  const login = await service.providers.createLogin(email)
  if (login.email !== email) throw new Error('AUTH_EMAIL_MISMATCH')
  const { access, personalLink } = await service.db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`free:${email}`}))`
      const samples = await tx.libraryFreeSample.findMany({ include: { asset: true } })
      for (const [kind, expected] of [
        ['score', 2],
        ['audio', 2],
        ['video', 2],
      ] as const)
        if (
          samples.filter(
            (sample) => sample.asset.kind === kind && sample.asset.instrument === 'violin',
          ).length !== expected
        )
          throw new AppError(
            503,
            'FREE_LIBRARY_UNAVAILABLE',
            'O teste grátis está sendo preparado. Tente novamente em instantes.',
          )
      const user = await tx.user.upsert({
        where: { id: login.userId },
        create: { id: login.userId, email },
        update: { email },
      })
      const link = await personalLibraryLink(
        tx,
        user.id,
        service.config.FRONTEND_URL,
        service.config.EMAIL_LINK_ENCRYPTION_KEY,
      )
      const record = await tx.libraryFreeAccess.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          emailLinkCiphertext: encryptLink(link, service.config.EMAIL_LINK_ENCRYPTION_KEY),
        },
      })
      if (!record.revokedAt && !record.emailSentAt)
        await tx.job.upsert({
          where: { id: `free-email/${record.id}` },
          update: {},
          create: {
            id: `free-email/${record.id}`,
            kind: 'FREE_ACCESS_EMAIL',
            resourceId: record.id,
          },
        })
      return { access: record, personalLink: link }
    },
    { timeout: 20000 },
  )
  if (!access.revokedAt && access.emailSentAt) {
    const snapshot = await librarySnapshot(service.db, access.userId)
    await service.providers.sendLogin(
      email,
      personalLink,
      `free-resend/${randomUUID()}`,
      !snapshot.products.length && !snapshot.previews.length,
    )
  }
}

export async function deliverFreeLibraryEmail(service: CheckoutService, accessId: string) {
  await service.db.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM library_free_access WHERE id = ${accessId}::uuid FOR UPDATE`
      const access = await tx.libraryFreeAccess.findUnique({
        where: { id: accessId },
        include: { user: true },
      })
      if (!access || access.revokedAt || access.emailSentAt) return
      const snapshot = await librarySnapshot(tx, access.userId)
      const link = decryptLink(access.emailLinkCiphertext, service.config.EMAIL_LINK_ENCRYPTION_KEY)
      await service.providers.sendLogin(
        access.user.email,
        link,
        `free-access/${access.id}`,
        !snapshot.products.length && !snapshot.previews.length,
      )
      await tx.libraryFreeAccess.update({
        where: { id: access.id },
        data: { emailSentAt: new Date() },
      })
    },
    { timeout: 20000 },
  )
}
