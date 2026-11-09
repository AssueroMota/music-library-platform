export interface SetlistSong {
  title: string
  artist: string
  instrument: string
}

export interface CustomSetlist {
  id: string
  title: string
  songs: SetlistSong[]
  type?: SetlistType
  eventDate?: string | null
  status?: 'draft' | 'ready'
}

export const SETLIST_TYPES = {
  personal: 'Setlist próprio',
  wedding: 'Casamento — cerimônia',
  wedding_ceremony_reception: 'Casamento — cerimônia + recepção',
  wedding_reception: 'Casamento — recepção',
  engagement: 'Noivado',
  wedding_anniversary: 'Bodas',
  birthday: 'Aniversário',
  debutante: 'Festa de 15 anos',
  children_party: 'Festa infantil',
  restaurant: 'Restaurante',
  bar: 'Bar',
  hotel: 'Hotel / resort',
  cocktail: 'Coquetel',
  corporate: 'Evento corporativo',
  graduation: 'Formatura',
  gathering: 'Confraternização',
  religious: 'Celebração religiosa / missa / culto',
  baptism: 'Batizado',
  show: 'Show / apresentação',
  serenade: 'Serenata / homenagem',
  christmas: 'Natal',
  new_year: 'Réveillon',
  commemorative: 'Data comemorativa',
  event: 'Outro evento',
} as const

export type SetlistType = keyof typeof SETLIST_TYPES
export const SETLIST_TYPE_IDS = Object.keys(SETLIST_TYPES) as [SetlistType, ...SetlistType[]]

export function setlistToday(now = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(now)
}

export function isSetlistExpired(
  setlist: Pick<CustomSetlist, 'type' | 'eventDate'>,
  today = setlistToday(),
) {
  return Boolean(
    setlist.type && setlist.type !== 'personal' && setlist.eventDate && setlist.eventDate < today,
  )
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
