import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, Maximize2, Music2, Play, Search, Video, X } from 'lucide-react'
import type { MemberAsset } from '../../shared/library'
import { normalizeSearch } from '../data/library'
import { LibrarySelect } from './LibrarySelect'
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
  const [style, setStyle] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const selected = videos.find((video) => video.id === selectedId)
  const styles = [...new Set(videos.map((video) => video.style).filter(Boolean))].sort()
  const filtered = videos
    .filter(
      (video) =>
        (!style || video.style === style) &&
        normalizeSearch(`${video.songTitle} ${video.title} ${video.artist}`).includes(
          normalizeSearch(search.trim()),
        ),
    )
    .sort((a, b) => (a.songTitle || a.title).localeCompare(b.songTitle || b.title, 'pt-BR'))
  const hasFilters = Boolean(search || style)
  function clearFilters() {
    setSearch('')
    setStyle('')
  }
  function openVideo(id: string) {
    setExpanded(false)
    setSelectedId(id)
  }

  return (
    <div
      className={`guided-scores repertoire ${selected ? 'has-selection' : ''} ${expanded ? 'is-focus-mode' : ''}`}
    >
      <div className="repertoire-filters">
        <div className="repertoire-search-field">
          <label htmlFor="guided-search">Encontre sua próxima música</label>
          <div className="repertoire-search">
            <Search size={19} aria-hidden="true" />
            <input
              id="guided-search"
              type="search"
              aria-label="Buscar partitura guiada ou artista"
              placeholder="Busque por música ou artista…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button aria-label="Limpar busca de vídeos" onClick={() => setSearch('')}>
                <X size={17} />
              </button>
            )}
          </div>
        </div>
        <LibrarySelect
          label="Estilo"
          value={style}
          onChange={(event) => setStyle(event.target.value)}
        >
          <option value="">Todos</option>
          {styles.map((name) => (
            <option key={name} value={name}>
              {name} ({videos.filter((video) => video.style === name).length})
            </option>
          ))}
        </LibrarySelect>
        {hasFilters && (
          <button className="repertoire-clear" onClick={clearFilters}>
            <X size={14} /> Limpar filtros
          </button>
        )}
      </div>
      <div className="repertoire-content">
        <div className="repertoire-catalog">
          <div className="repertoire-heading">
            <div>
              <h2>Partituras guiadas</h2>
              <span>Escolha uma música para assistir à partitura em vídeo.</span>
            </div>
            <p aria-live="polite">
              <span>
                {filtered.length} {filtered.length === 1 ? 'vídeo' : 'vídeos'}
              </span>
            </p>
          </div>
          {filtered.length > 0 && (
            <div className="repertoire-table-wrap">
              <table className="repertoire-table">
                <caption className="sr-only">Partituras guiadas em vídeo da sua biblioteca</caption>
                <thead>
                  <tr>
                    <th scope="col">Música</th>
                    <th scope="col" className="repertoire-style-column">
                      Estilo
                    </th>
                    <th scope="col">Materiais</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((video) => (
                    <tr
                      key={video.id}
                      className={selectedId === video.id ? 'repertoire-selected' : ''}
                    >
                      <th scope="row">
                        <button
                          className="repertoire-song"
                          onClick={() => openVideo(video.id)}
                          aria-label={`Abrir partitura guiada de ${video.songTitle || video.title}`}
                          aria-pressed={selectedId === video.id}
                        >
                          <span
                            className={`repertoire-song-icon ${selectedId === video.id ? 'is-selected' : ''}`}
                          >
                            {selectedId === video.id ? <Check size={18} /> : <Music2 size={18} />}
                          </span>
                          <span className="repertoire-song-details">
                            <strong>{video.songTitle || video.title}</strong>
                            <small>{video.artist}</small>
                            <span className="repertoire-inline-style">
                              {video.style || 'Sem estilo'}
                            </span>
                          </span>
                        </button>
                      </th>
                      <td className="repertoire-style-column">
                        <span className="repertoire-style">{video.style || 'Não informado'}</span>
                      </td>
                      <td className="repertoire-materials-cell">
                        <div className="repertoire-row-actions">
                          <button
                            className="repertoire-action repertoire-score-action"
                            aria-label={`Assistir ${video.songTitle || video.title}`}
                            onClick={() => openVideo(video.id)}
                          >
                            <Play size={17} />
                            <span>Assistir</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!filtered.length && (
            <div className="repertoire-empty">
              <Video size={30} />
              <h3>
                {videos.length
                  ? 'Nenhum vídeo encontrado.'
                  : 'As partituras guiadas estão a caminho.'}
              </h3>
              <p>
                {videos.length
                  ? 'Experimente outro nome ou limpe os filtros.'
                  : 'Os vídeos liberados para sua conta aparecerão nesta aba.'}
              </p>
              {hasFilters && (
                <button className="repertoire-action" onClick={clearFilters}>
                  Ver todos os vídeos
                </button>
              )}
            </div>
          )}
        </div>
        {selected && (
          <GuidedWorkspace
            key={selected.id}
            asset={selected}
            token={token}
            previewMedia={previewMedia}
            expanded={expanded}
            onExpand={() => setExpanded((value) => !value)}
            onClose={() => {
              setSelectedId(null)
              setExpanded(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

function GuidedWorkspace({
  asset,
  token,
  previewMedia,
  expanded,
  onExpand,
  onClose,
}: {
  asset: MemberAsset
  token: string
  previewMedia?: Readonly<Record<string, string>>
  expanded: boolean
  onExpand: () => void
  onClose: () => void
}) {
  const panel = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const trigger = document.activeElement
    heading.current?.focus({ preventScroll: true })
    if (window.matchMedia('(max-width: 1099px)').matches)
      panel.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    return () => {
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true })
    }
  }, [])
  return (
    <section
      ref={panel}
      className="repertoire-workspace"
      aria-label={`Vídeo de ${asset.songTitle || asset.title}`}
    >
      <header>
        <div>
          <span className="eyebrow">
            <Video size={14} /> ÁREA DE ESTUDO
          </span>
          <h2 ref={heading} tabIndex={-1}>
            {asset.songTitle || asset.title}
          </h2>
          <p>{[asset.artist, asset.style].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="repertoire-workspace-actions">
          <button
            className="repertoire-expand"
            aria-label={expanded ? 'Mostrar lista de músicas' : 'Ampliar área de estudo'}
            title={expanded ? 'Mostrar lista de músicas' : 'Ampliar área de estudo'}
            aria-pressed={expanded}
            onClick={onExpand}
          >
            {expanded ? <ArrowLeft size={18} /> : <Maximize2 size={18} />}
          </button>
          <button aria-label="Fechar vídeo" title="Fechar vídeo" onClick={onClose}>
            <X size={21} />
          </button>
        </div>
      </header>
      <div className="repertoire-score">
        <div className="repertoire-media-heading">
          <h3>
            <Video size={19} /> Partitura guiada
          </h3>
        </div>
        <ProtectedMedia asset={asset} token={token} previewMedia={previewMedia} />
      </div>
    </section>
  )
}
