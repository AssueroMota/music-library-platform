import { guidedScores } from '../../shared/guided-scores'
import { publicRepertoire } from '../../shared/public-repertoire'
import { normalizeSearch } from '../lib/normalize-search'

type CatalogSong = {
  title: string
  artist: string
  style: string
  hasScore: boolean
  hasPlayback: boolean
  hasGuide: boolean
}

function catalogSongs() {
  const groups = new Map<string, CatalogSong[]>()
  function add(song: CatalogSong) {
    const versions = groups.get(song.title) ?? []
    versions.push(song)
    groups.set(song.title, versions)
  }

  for (const [title, artist, style, hasPlayback] of publicRepertoire) {
    add({ title, artist, style, hasScore: true, hasPlayback, hasGuide: false })
  }
  for (const [title, artist, style] of guidedScores) {
    const versions = groups.get(title) ?? []
    const match =
      versions.find((song) => song.artist === artist) ??
      (versions.length === 1 && !versions[0].artist ? versions[0] : undefined)
    if (match) {
      match.hasGuide = true
      match.artist ||= artist
    } else {
      add({ title, artist, style, hasScore: false, hasPlayback: false, hasGuide: true })
    }
  }
  return [...groups.values()].flat()
}

export const violinCatalog = catalogSongs().map((song) => ({
  ...song,
  id: [song.title, song.artist]
    .map((value) =>
      normalizeSearch(value)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    )
    .join('--'),
}))
