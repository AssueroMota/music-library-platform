import { createHmac, timingSafeEqual } from 'node:crypto'
import type { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { setlistSongId } from '../shared/custom-setlists.js'
import type { SetlistPlayback } from '../shared/setlist-share.js'
import { serializeSetlist } from './custom-setlists.js'
import { librarySnapshot } from './library-queries.js'
import { AppError, hashToken } from './security.js'

const tokenPattern = /^([a-f0-9-]{36})\.(\d{10})\.([a-zA-Z0-9_-]{43})$/
const referenceTracks = new Map<string, SetlistPlayback>([
  [
    setlistSongId({ title: 'I See The Light', artist: 'Disney Music', instrument: 'violin' }),
    { kind: 'video', videoId: 'ILRs2r6lcHY' },
  ],
  [
    setlistSongId({ title: 'A Bela e Fera', artist: '', instrument: 'violin' }),
    { kind: 'reference', path: '/audio/beauty-and-the-beast.mp3' },
  ],
  [
    setlistSongId({ title: 'A Whole New World', artist: '', instrument: 'violin' }),
    { kind: 'reference', path: '/audio/a-whole-new-world.mp3' },
  ],
])

function signature(payload: string, key: string) {
  return createHmac('sha256', Buffer.from(key, 'hex'))
    .update('music-library:setlist-share:v1\0')
    .update(payload)
    .digest('base64url')
}

export function createSetlistShareToken(id: string, expiresAt: Date, key: string) {
  const payload = `${z.uuid().parse(id)}.${Math.floor(expiresAt.getTime() / 1000)}`
  return `${payload}.${signature(payload, key)}`
}

export function shareUnavailable() {
  return new AppError(404, 'SETLIST_SHARE_UNAVAILABLE', 'Este link não está disponível ou expirou.')
}

export async function sharedSetlist(db: PrismaClient, header: string | undefined, key: string) {
  const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
  const match = tokenPattern.exec(token)
  if (!match) throw shareUnavailable()
  const [, id, seconds, provided] = match
  const expected = signature(`${id}.${seconds}`, key)
  if (
    !timingSafeEqual(Buffer.from(expected), Buffer.from(provided)) ||
    Number(seconds) * 1000 <= Date.now()
  )
    throw shareUnavailable()

  const record = await db.customSetlist.findUnique({ where: { id } })
  if (!record || record.status !== 'ready') throw shareUnavailable()
  const list = serializeSetlist(record)
  const { assets } = await librarySnapshot(db, record.userId)
  const audio = new Map<string, string>()
  for (const asset of assets) {
    if (asset.kind !== 'audio') continue
    const identity = setlistSongId({
      title: asset.songTitle || asset.title,
      artist: asset.artist,
      instrument: asset.instrument,
    })
    if (!audio.has(identity)) audio.set(identity, asset.storageKey)
  }

  return {
    title: list.title,
    tracks: list.songs.map((song) => {
      const identity = setlistSongId(song)
      const storageKey = audio.get(identity)
      const playback: SetlistPlayback | null = storageKey
        ? { kind: 'library' }
        : (referenceTracks.get(identity) ?? null)
      return {
        id: hashToken(identity),
        title: song.title,
        artist: song.artist,
        playback,
        storageKey,
      }
    }),
  }
}
