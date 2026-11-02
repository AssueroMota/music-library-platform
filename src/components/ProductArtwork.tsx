import { Headphones } from 'lucide-react'

export type ArtworkKind =
  'basic' | 'complete' | 'gospel' | 'mpb' | 'international' | 'classics' | 'guided'

const covers: Record<ArtworkKind, string> = {
  basic: 'main',
  complete: 'main',
  gospel: 'gospel-18',
  mpb: 'mpb-13',
  international: 'international-56',
  classics: 'classics-10',
  guided: 'guided-23',
}

export function ProductArtwork({ kind }: { kind: ArtworkKind }) {
  return (
    <div className={`package-art package-art-${kind}`} aria-hidden="true">
      <img
        className="package-book-mockup"
        src={`/images/collections/violin-${covers[kind]}.webp`}
        alt=""
        loading="lazy"
        decoding="async"
        width="1086"
        height="1448"
      />
      {kind === 'complete' && (
        <div className="package-player">
          <Headphones size={22} />
          <div>
            <span>PARTITURAS + PLAYBACKS</span>
            <div className="package-wave">
              {[12, 22, 15, 30, 20, 34, 16, 26, 12, 23, 32, 17, 25, 13].map((height, index) => (
                <i key={index} style={{ height }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
