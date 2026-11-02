import { useEffect, useRef, useState } from 'react'
import { Play, Search, Video, X } from 'lucide-react'
import type { MemberAsset } from '../../shared/library'
import { normalizeSearch } from '../data/library'
import { ProtectedMedia } from './ProtectedMedia'

export function LibraryGuidedScores({
  videos,
  token,
  previewMedia,
}: {
  videos: MemberAsset[]
  token: string
  previewMedia?: Readonly<Record<string, string>>
}) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const selected = videos.find((video) => video.id === selectedId)
  const filtered = videos
    .filter((video) =>
      normalizeSearch(`${video.songTitle} ${video.title} ${video.artist}`).includes(
        normalizeSearch(search.trim()),
      ),
    )
    .sort((a, b) => (a.songTitle || a.title).localeCompare(b.songTitle || b.title, 'pt-BR'))
  useEffect(() => {
    if (selectedId) {
      heading.current?.focus({ preventScroll: true })
      heading.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedId])
  return (
    <div className="guided-scores">
      <header className="library-setlists-heading">
        <div>
          <h2>Partituras guiadas</h2>
          <p>
            Dê o play e toque junto: acompanhe a partitura passando na tela durante a música. Pause,
            volte ou ajuste a velocidade no próprio vídeo para estudar no seu ritmo.
          </p>
        </div>
        <span>{videos.length} vídeos</span>
      </header>
      {selected && (
        <section
          className="guided-player"
          aria-label={`Vídeo de ${selected.songTitle || selected.title}`}
        >
          <header>
            <div>
              <span className="eyebrow">PARTITURA NA TELA · TOQUE JUNTO</span>
              <h3 ref={heading} tabIndex={-1}>
                {selected.songTitle || selected.title}
              </h3>
              <p>{selected.artist}</p>
            </div>
            <button
              className="repertoire-clear"
              aria-label="Fechar vídeo"
              onClick={() => setSelectedId(null)}
            >
              <X size={18} /> Fechar
            </button>
          </header>
          <ProtectedMedia
            key={selected.id}
            asset={selected}
            token={token}
            previewMedia={previewMedia}
          />
        </section>
      )}
      <div className="repertoire-search guided-search">
        <Search size={19} aria-hidden="true" />
        <input
          type="search"
          aria-label="Buscar partitura guiada ou artista"
          placeholder="Busque uma partitura guiada…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search && (
          <button aria-label="Limpar busca de vídeos" onClick={() => setSearch('')}>
            <X size={17} />
          </button>
        )}
      </div>
      <p className="guided-results" role="status">
        {filtered.length} vídeos disponíveis
      </p>
      <div className="guided-grid">
        {filtered.map((video) => (
          <button
            className="guided-card"
            key={video.id}
            aria-label={`Assistir ${video.songTitle || video.title}`}
            aria-pressed={selectedId === video.id}
            onClick={() => setSelectedId(video.id)}
          >
            <span className="guided-card-icon">
              <Play size={22} />
            </span>
            <span className="guided-card-copy">
              <strong>{video.songTitle || video.title}</strong>
              <small>{video.artist || 'Partitura com acompanhamento'}</small>
              <span>
                <Video size={13} /> Partitura guiada
              </span>
            </span>
          </button>
        ))}
      </div>
      {!filtered.length && (
        <div className="repertoire-empty">
          <Video size={30} />
          <h3>
            {videos.length ? 'Nenhum vídeo encontrado.' : 'As partituras guiadas estão a caminho.'}
          </h3>
          <p>
            {videos.length
              ? 'Experimente outra música ou artista.'
              : 'Os vídeos liberados para sua conta aparecerão nesta aba.'}
          </p>
          {search && (
            <button className="repertoire-action" onClick={() => setSearch('')}>
              Ver todos os vídeos
            </button>
          )}
        </div>
      )}
    </div>
  )
}
