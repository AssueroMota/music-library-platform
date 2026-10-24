import 'dotenv/config'
import { parseArgs } from 'node:util'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Operator-only command. No payment, order, entitlement or email is created here.
const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    instrument: { type: 'string' },
    hours: { type: 'string' },
  },
})
const input = z
  .object({
    email: z.email().transform((email) => email.toLowerCase()),
    instrument: z.enum(['violin', 'saxophone', 'flute', 'guitar', 'viola', 'cello']),
    hours: z.coerce.number().int().min(1).max(168).default(48),
  })
  .safeParse(values)
if (!input.success)
  throw new Error('Informe --email, --instrument e opcionalmente --hours (1 a 168).')
const env = z
  .object({
    SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    FRONTEND_URL: z.url(),
  })
  .parse(process.env)
const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})
const db = new PrismaClient()
try {
  const { email, instrument, hours } = input.data
  const { data, error } = await client.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${new URL(env.FRONTEND_URL).origin}/biblioteca` },
  })
  if (error || !data.user || data.user.email?.toLowerCase() !== email)
    throw new Error('Falha ao preparar conta de acesso.')
  const expiresAt = new Date(Date.now() + hours * 3600000)
  await db.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { email } })
    if (existing && existing.id !== data.user.id)
      throw new Error('Identidade divergente; confira a conta antes de continuar.')
    await tx.user.upsert({
      where: { id: data.user.id },
      create: { id: data.user.id, email },
      update: { email },
    })
    await tx.libraryPreviewAccess.upsert({
      where: { userId_instrument: { userId: data.user.id, instrument } },
      create: { userId: data.user.id, instrument, expiresAt },
      update: { expiresAt, revokedAt: null },
    })
  })
  console.info(
    JSON.stringify({
      previewGranted: true,
      instrument,
      hours,
      expiresAt: expiresAt.toISOString(),
      emailSent: false,
    }),
  )
} finally {
  await db.$disconnect()
}
