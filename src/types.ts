export type InstrumentId = 'violin' | 'saxophone' | 'flute' | 'guitar' | 'viola' | 'cello'

export interface Instrument {
  id: InstrumentId
  name: string
  description: string
  tuning: string
  detail: string
  imageIndex: number
}

export interface Track {
  id: string
  title: string
  composer: string
  instrument: InstrumentId
  style: 'Estudo' | 'Contemporâneo'
  key: string
  bpm: number
  scoreNotes: number[]
  audio: { backing: string; lead: string }
}

export interface Plan {
  id: string
  name: string
  description: string
  benefits: string[]
  price?: number
  accessMode: string
  checkoutUrl?: string
  featured?: boolean
}

export type LibraryFileKind = 'score' | 'audio'

export interface LibraryFile {
  id: string
  name: string
  kind: LibraryFileKind
  track: Track
}
