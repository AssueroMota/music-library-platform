import { tracks } from './content'
import type { LibraryFile, LibraryFileKind } from '../types'

export const fileTypes: Record<LibraryFileKind, string> = {
  score: 'Partitura · prévia',
  audio: 'Áudio WAV',
}

export const libraryFiles: LibraryFile[] = tracks.flatMap((track) => [
  { id: `${track.id}-score`, name: track.title, kind: 'score', track },
  { id: `${track.id}-audio`, name: `${track.title}.wav`, kind: 'audio', track },
])

export function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
