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
  setlistLimit?: 10 | 42
  products: { id: string; name: string }[]
  assets: MemberAsset[]
  previewAccess?: { instrument: string; expiresAt: string }[]
  personalLink?: string | null
}

export function libraryFileFormat(key: string) {
  const extension = key.split('.').pop()?.toLowerCase()
  return extension && ['pdf', 'png', 'mp3', 'wav'].includes(extension) ? extension : null
}
