export type SetlistPlayback =
  { kind: 'library' } | { kind: 'reference'; path: string } | { kind: 'video'; videoId: string }

export interface SharedSetlist {
  title: string
  tracks: {
    id: string
    title: string
    artist: string
    playback: SetlistPlayback | null
  }[]
}
