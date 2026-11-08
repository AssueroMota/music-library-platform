import type { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { MAX_SETLIST_SONGS, setlistSongId } from '../shared/custom-setlists.js'
import { librarySnapshot } from './library-queries.js'
import { AppError } from './security.js'

const songSchema = z
  .object({
    title: z.string().min(1).max(300),
    artist: z.string().max(300),
    instrument: z.string().min(1).max(80),
  })
  .strict()

export const customSetlistSchema = z
  .object({
    title: z.string().trim().min(1).max(100),
    songs: z.array(songSchema).min(1).max(MAX_SETLIST_SONGS),
  })
  .strict()

export function serializeSetlist(record: { id: string; title: string; songs: unknown }) {
  return { id: record.id, title: record.title, songs: z.array(songSchema).parse(record.songs) }
}

export function setlistNotFound() {
  return new AppError(404, 'SETLIST_NOT_FOUND', 'Setlist não encontrado.')
}

export async function validateSetlist(db: PrismaClient, userId: string, body: unknown) {
  const input = customSetlistSchema.parse(body)
  const { assets } = await librarySnapshot(db, userId)
  const available = new Map(
    assets
      .filter((asset) => asset.kind === 'score' || asset.kind === 'audio')
      .map((asset) => {
        const song = {
          title: asset.songTitle || asset.title,
          artist: asset.artist,
          instrument: asset.instrument,
        }
        return [setlistSongId(song), song] as const
      }),
  )
  const ids = input.songs.map(setlistSongId)
  if (new Set(ids).size !== ids.length)
    throw new AppError(400, 'DUPLICATE_SONG', 'Cada música pode aparecer uma vez no setlist.')
  if (ids.some((id) => !available.has(id)))
    throw new AppError(
      403,
      'SONG_UNAVAILABLE',
      'Selecione somente músicas disponíveis no seu acesso atual.',
    )
  return { title: input.title, songs: ids.map((id) => available.get(id)!) }
}
