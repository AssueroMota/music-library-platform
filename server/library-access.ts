import { randomBytes } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { decryptLink, encryptLink, hashToken } from './security.js'

type LinkStore = Pick<Prisma.TransactionClient, 'libraryAccessLink'>

// The ID is public; its independent 256-bit secret stays in the URL fragment.
export async function personalLibraryLink(
  db: LinkStore,
  userId: string,
  origin: string,
  encryptionKey: string,
  rotate = false,
) {
  const existing = await db.libraryAccessLink.findUnique({ where: { userId } })
  if (existing && !rotate) {
    const url = new URL('/biblioteca', origin)
    url.hash = new URLSearchParams({
      id: existing.id,
      acesso: decryptLink(existing.secretCiphertext, encryptionKey),
    }).toString()
    return url.href
  }
  const secret = randomBytes(32).toString('hex')
  const credentials = {
    secretHash: hashToken(secret),
    secretCiphertext: encryptLink(secret, encryptionKey),
  }
  // Native INSERT ... ON CONFLICT avoids racing Prisma's empty-update upsert.
  await db.libraryAccessLink.createMany({ data: { userId, ...credentials }, skipDuplicates: true })
  const record = rotate
    ? await db.libraryAccessLink.update({
        where: { userId },
        data: { ...credentials, rotatedAt: new Date() },
      })
    : await db.libraryAccessLink.findUniqueOrThrow({ where: { userId } })
  const url = new URL('/biblioteca', origin)
  url.hash = new URLSearchParams({
    id: record.id,
    acesso: decryptLink(record.secretCiphertext, encryptionKey),
  }).toString()
  return url.href
}
