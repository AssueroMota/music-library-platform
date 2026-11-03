import { useState } from 'react'
import { Check, Music2, Play, Search, Video, X } from 'lucide-react'
import type { MemberAsset } from '../../shared/library'
import { normalizeSearch } from '../data/library'
import { LibrarySelect } from './LibrarySelect'
import { ProtectedMedia } from './ProtectedMedia'
import { StudyDialog } from './StudyDialog'

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
    setSelectedId(id)
  }

  return (
    <div className="guided-scores repertoire">
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
            onClose={() => {
              setSelectedId(null)
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
  onClose,
}: {
  asset: MemberAsset
  token: string
  previewMedia?: Readonly<Record<string, string>>
  onClose: () => void
}) {
  return (
    <StudyDialog
      title={asset.songTitle || asset.title}
      label={`Vídeo de ${asset.songTitle || asset.title}`}
      closeLabel="Fechar vídeo"
      onClose={onClose}
    >
      <div className="repertoire-study-body repertoire-study-video">
        <ProtectedMedia asset={asset} token={token} previewMedia={previewMedia} autoPlay minimal />
      </div>
    </StudyDialog>
  )
}
