export interface MemberAsset {
  id: string
  title: string
  songTitle: string
  artist: string
  style: string
  instrument: string
  kind: string
  format: string | null
}

export interface MemberLibraryData {
  setlistLimit?: 0 | 10 | 42
  freeAccess?: boolean
  accessMode?: 'free' | 'basic' | 'complete'
  products: { id: string; name: string }[]
  assets: MemberAsset[]
  previewAccess?: { instrument: string; expiresAt: string }[]
  personalLink?: string | null
}

export function libraryFileFormat(key: string) {
  const extension = key.split('.').pop()?.toLowerCase()
  return extension && ['pdf', 'png', 'mp3', 'wav', 'mp4'].includes(extension) ? extension : null
}
