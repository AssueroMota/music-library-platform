import 'dotenv/config'
import { parseArgs } from 'node:util'
import { writeFile } from 'node:fs/promises'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { personalLibraryLink } from './library-access.js'

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    rotate: { type: 'boolean', default: false },
    out: { type: 'string' },
  },
})
const input = z
  .object({
    email: z.email().transform((value) => value.toLowerCase()),
    rotate: z.boolean(),
    out: z.string().endsWith('.local').optional(),
  })
  .safeParse(values)
if (!input.success)
  throw new Error('Informe --email e, opcionalmente, --rotate e --out arquivo.local.')
const env = z
  .object({
    DATABASE_URL: z.string().min(1),
    FRONTEND_URL: z.url(),
    EMAIL_LINK_ENCRYPTION_KEY: z.string().regex(/^[a-f0-9]{64}$/i),
  })
  .parse(process.env)
const db = new PrismaClient()
try {
  const user = await db.user.findUnique({
    where: { email: input.data.email },
    include: {
      entitlements: { where: { revokedAt: null, order: { status: 'APPROVED' } }, take: 1 },
      previewAccess: { where: { revokedAt: null, expiresAt: { gt: new Date() } }, take: 1 },
    },
  })
  if (!user || (!user.entitlements.length && !user.previewAccess.length))
    throw new Error('Conta sem acesso ativo.')
  const url = await personalLibraryLink(
    db,
    user.id,
    env.FRONTEND_URL,
    env.EMAIL_LINK_ENCRYPTION_KEY,
    input.data.rotate,
  )
  if (input.data.out) await writeFile(input.data.out, JSON.stringify({ url }), { mode: 0o600 })
  console.info(
    JSON.stringify({
      personalLinkReady: true,
      rotated: input.data.rotate,
      savedLocally: Boolean(input.data.out),
      emailSent: false,
    }),
  )
} finally {
  await db.$disconnect()
}
