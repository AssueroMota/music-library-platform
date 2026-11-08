export interface SetlistSong {
  title: string
  artist: string
  instrument: string
}

export interface CustomSetlist {
  id: string
  title: string
  songs: SetlistSong[]
}

// Match the repertoire grouping, including artist and instrument to distinguish versions.
export function setlistSongId(song: SetlistSong) {
  const normalize = (value: string) =>
    value
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  return JSON.stringify([song.instrument, normalize(song.title), normalize(song.artist)])
}

export const MAX_SETLIST_SONGS = 200
