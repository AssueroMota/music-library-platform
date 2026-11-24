import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { configSchema } from './config.js'
import { createSetlistShareToken } from './setlist-share.js'

const [, , title, expiry] = process.argv
const expiresAt = new Date(expiry ?? '')
if (!title || !Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
  process.stderr.write(
    'Uso: npx tsx server/share-setlist-link.ts "Título do setlist" "Data ISO com fuso"\n',
  )
  process.exit(1)
}

const config = configSchema.parse(process.env)
const db = new PrismaClient()
try {
  const records = await db.customSetlist.findMany({
    where: { title, status: 'ready' },
    take: 2,
    select: { id: true },
  })
  if (records.length !== 1) {
    process.stderr.write('O título precisa identificar exatamente um setlist salvo.\n')
    process.exitCode = 1
  } else {
    const token = createSetlistShareToken(
      records[0].id,
      expiresAt,
      config.EMAIL_LINK_ENCRYPTION_KEY,
    )
    const url = new URL('/playlist', config.FRONTEND_URL)
    url.hash = new URLSearchParams({ acesso: token }).toString()
    process.stdout.write(url.href + '\n')
  }
} finally {
  await db.$disconnect()
}
