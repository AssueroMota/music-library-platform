import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Administrative CLI: local paths come from the operator's manifest, never an HTTP request.
const env = z
  .object({
    DATABASE_URL: z.string().min(1),
    SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_STORAGE_BUCKET: z.string().default('music-library'),
  })
  .parse(process.env)
if (!process.argv[2]) throw new Error('Informe o caminho do manifesto JSON.')
const manifestPath = resolve(process.argv[2])
const manifest = z
  .array(
    z.object({
      title: z.string().min(1).max(200),
      songTitle: z.string().trim().max(200).default(''),
      artist: z.string().trim().max(200).default(''),
      style: z.string().trim().max(100).default(''),
      instrument: z.enum(['violin', 'saxophone', 'flute', 'guitar', 'viola', 'cello']),
      kind: z.enum(['score', 'audio']),
      file: z.string().min(1),
      storageKey: z
        .string()
        .regex(/^[a-zA-Z0-9/_\-.]+$/)
        .refine((key) => !key.includes('..') && !key.startsWith('/')),
    }),
  )
  .min(1)
  .parse(JSON.parse(await readFile(manifestPath, 'utf8')))
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})
const db = new PrismaClient()
try {
  const { data: bucket, error: bucketError } = await supabase.storage.getBucket(
    env.SUPABASE_STORAGE_BUCKET,
  )
  if (bucketError || !bucket || bucket.public)
    throw new Error('Configure um bucket privado antes de importar.')
  for (const item of manifest) {
    const extension = extname(item.file).toLowerCase()
    const mime = (
      {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
      } as Record<string, string>
    )[extension]
    if (!mime || (item.kind === 'score') !== ['.pdf', '.png'].includes(extension))
      throw new Error('Tipo de arquivo incompatível com o material.')
    const bytes = await readFile(resolve(dirname(manifestPath), item.file))
    const existing = await db.libraryAsset.findUnique({ where: { storageKey: item.storageKey } })
    if (!existing) {
      const { error } = await supabase.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .upload(item.storageKey, bytes, { contentType: mime, upsert: false })
      if (error)
        throw new Error(`Falha ao importar ${item.storageKey}. Confira o storage antes de repetir.`)
    }
    await db.libraryAsset.upsert({
      where: { storageKey: item.storageKey },
      create: {
        title: item.title,
        songTitle: item.songTitle,
        artist: item.artist,
        style: item.style,
        instrument: item.instrument,
        kind: item.kind,
        storageKey: item.storageKey,
      },
      update: {
        title: item.title,
        songTitle: item.songTitle,
        artist: item.artist,
        style: item.style,
        instrument: item.instrument,
        kind: item.kind,
      },
    })
    console.info(`Material registrado: ${item.title}`)
  }
} finally {
  await db.$disconnect()
}
