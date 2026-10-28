import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  FileMusic,
  Headphones,
  LoaderCircle,
  ListMusic,
  Maximize2,
  Music2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import type { MemberAsset, MemberLibraryData } from '../../shared/library'
import { api, LIBRARY_REQUEST_TIMEOUT_MS } from '../lib/api'
import { allInstruments as instruments } from '../data/content'
import { normalizeSearch } from '../data/library'
import { LibrarySelect } from './LibrarySelect'
import { LibrarySetlists } from './LibrarySetlists'
import { resolveViolinSetlists } from '../data/setlists'

const ScorePdf = lazy(() => import('./ScorePdf').then((module) => ({ default: module.ScorePdf })))

interface Song {
  id: string
  title: string
  artist: string
  style: string
  instrument: string
  assets: MemberAsset[]
}

function instrumentName(id: string) {
  return instruments.find((instrument) => instrument.id === id)?.name ?? id
}

export function MemberRepertoire({
  data,
  token,
  previewMedia,
}: {
  data: MemberLibraryData
  token: string
  previewMedia?: Readonly<Record<string, string>>
}) {
  const [search, setSearch] = useState('')
  const [instrument, setInstrument] = useState('')
  const [style, setStyle] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [order, setOrder] = useState('title')
  const [playback, setPlayback] = useState('all')
  const [focusMode, setFocusMode] = useState(false)
  const [view, setView] = useState<'songs' | 'setlists'>('songs')
  const [setlistId, setSetlistId] = useState<string | null>(null)
  const setlistHeading = useRef<HTMLHeadingElement>(null)
  const songs = useMemo(() => {
    const grouped = new Map<string, Song>()
    for (const asset of data.assets) {
      const title = asset.songTitle || asset.title
      const id = JSON.stringify([
        asset.instrument,
        normalizeSearch(title),
        normalizeSearch(asset.artist || ''),
      ])
      const song = grouped.get(id) ?? {
        id,
        title,
        artist: asset.artist || '',
        style: asset.style || '',
        instrument: asset.instrument,
        assets: [],
      }
      song.assets.push(asset)
      if (!song.style && asset.style) song.style = asset.style
      grouped.set(id, song)
    }
    return [...grouped.values()].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
  }, [data.assets])
  const setlists = useMemo(() => resolveViolinSetlists(songs), [songs])
  const activeSetlist =
    view === 'setlists' ? setlists.find((item) => item.id === setlistId) : undefined
  useEffect(() => {
    if (activeSetlist) setlistHeading.current?.focus()
  }, [activeSetlist])
  const collection = activeSetlist?.songs ?? songs
  const styles = [...new Set(songs.map((song) => song.style).filter(Boolean))].sort()
  const collectionStyles = [...new Set(collection.map((song) => song.style).filter(Boolean))].sort()
  const availableInstruments = [...new Set(songs.map((song) => song.instrument))]
  const audioCount = collection.filter((song) =>
    song.assets.some((asset) => asset.kind === 'audio'),
  ).length
  const scoreCount = data.assets.filter((asset) => asset.kind === 'score').length
  const filtered = collection
    .filter(
      (song) =>
        (!instrument || song.instrument === instrument) &&
        (!style || song.style === style) &&
        (playback === 'all' ||
          song.assets.some((asset) => asset.kind === 'audio') === (playback === 'with')) &&
        normalizeSearch(`${song.title} ${song.artist}`).includes(normalizeSearch(search.trim())),
    )
    .sort((a, b) =>
      order === 'setlist' && activeSetlist
        ? collection.indexOf(a) - collection.indexOf(b)
        : order === 'artist'
          ? (a.artist || a.title).localeCompare(b.artist || b.title, 'pt-BR') ||
            a.title.localeCompare(b.title, 'pt-BR')
          : order === 'title-desc'
            ? b.title.localeCompare(a.title, 'pt-BR')
            : a.title.localeCompare(b.title, 'pt-BR'),
    )
  const selected = songs.find((song) => song.id === selectedId)
  const hasFilters = Boolean(search || instrument || style || playback !== 'all')
  function clearFilters() {
    setSearch('')
    setInstrument('')
    setStyle('')
    setPlayback('all')
  }
  function openSong(id: string) {
    setFocusMode(false)
    setSelectedId(id)
  }
  function changeView(next: 'songs' | 'setlists') {
    setView(next)
    setSetlistId(null)
    setSelectedId(null)
    setFocusMode(false)
    clearFilters()
    setOrder('title')
  }
  function openSetlist(id: string) {
    setSetlistId(id)
    setSelectedId(null)
    setFocusMode(false)
    clearFilters()
    setOrder('setlist')
  }
  const selectedPosition = activeSetlist?.songs.findIndex((song) => song.id === selectedId) ?? -1

  return (
    <section
      className={`repertoire ${selected ? 'has-selection' : ''} ${focusMode ? 'is-focus-mode' : ''}`}
      aria-label="Repertório disponível"
    >
      <div className="repertoire-overview" role="group" aria-label="Resumo da coleção">
        <div>
          <span className="repertoire-stat-icon">
            <Music2 size={20} />
          </span>
          <span>
            <strong>{songs.length}</strong>
            <span>músicas na coleção</span>
          </span>
        </div>
        <div>
          <span className="repertoire-stat-icon">
            <BookOpen size={20} />
          </span>
          <span>
            <strong>{scoreCount}</strong>
            <span>partituras disponíveis</span>
          </span>
        </div>
        <div>
          <span className="repertoire-stat-icon">
            <SlidersHorizontal size={20} />
          </span>
          <span>
            <strong>{styles.length}</strong>
            <span>estilos para explorar</span>
          </span>
        </div>
      </div>
      {setlists.length > 0 && (
        <nav className="library-collection-nav" aria-label="Explorar biblioteca">
          <button aria-pressed={view === 'songs'} onClick={() => changeView('songs')}>
            <Music2 size={18} /> Todas as músicas <span>{songs.length}</span>
          </button>
          <button aria-pressed={view === 'setlists'} onClick={() => changeView('setlists')}>
            <ListMusic size={18} /> Setlists prontos <span>{setlists.length}</span>
          </button>
        </nav>
      )}
      {view === 'setlists' && !activeSetlist ? (
        <LibrarySetlists setlists={setlists} onOpen={openSetlist} />
      ) : (
        <>
          {activeSetlist && (
            <div className="library-setlist-intro">
              <button className="repertoire-clear" onClick={() => changeView('setlists')}>
                <ArrowLeft size={16} /> Voltar aos setlists
              </button>
              <span className="library-setlist-occasion">{activeSetlist.occasion}</span>
              <h2 ref={setlistHeading} tabIndex={-1}>
                {activeSetlist.title}
              </h2>
              <p>{activeSetlist.description} Abra a primeira partitura e avance pelas músicas.</p>
              <span>{activeSetlist.songs.length} músicas na ordem sugerida</span>
            </div>
          )}
          <div className="repertoire-filters">
            <div className="repertoire-search-field">
              <label htmlFor="repertoire-search">Encontre sua próxima música</label>
              <div className="repertoire-search">
                <Search size={19} aria-hidden="true" />
                <input
                  id="repertoire-search"
                  aria-label="Buscar música ou artista"
                  type="search"
                  placeholder="Busque por música ou artista…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button aria-label="Limpar busca" onClick={() => setSearch('')}>
                    <X size={17} />
                  </button>
                )}
              </div>
            </div>
            {availableInstruments.length > 1 && (
              <LibrarySelect
                label="Instrumento"
                value={instrument}
                onChange={(event) => setInstrument(event.target.value)}
              >
                <option value="">Todos os instrumentos</option>
                {availableInstruments.map((id) => (
                  <option key={id} value={id}>
                    {instrumentName(id)}
                  </option>
                ))}
              </LibrarySelect>
            )}
            <LibrarySelect
              label="Estilo"
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            >
              <option value="">Todos</option>
              {collectionStyles.map((name) => (
                <option key={name} value={name}>
                  {name} ({collection.filter((song) => song.style === name).length})
                </option>
              ))}
            </LibrarySelect>
            <LibrarySelect
              label="Playback"
              value={playback}
              onChange={(event) => setPlayback(event.target.value)}
            >
              <option value="all">Todas as músicas ({collection.length})</option>
              <option value="with">Com playback ({audioCount})</option>
              <option value="without">Sem playback ({collection.length - audioCount})</option>
            </LibrarySelect>
            <LibrarySelect
              label="Ordenar por"
              value={order}
              onChange={(event) => setOrder(event.target.value)}
            >
              {activeSetlist && <option value="setlist">Ordem do setlist</option>}
              <option value="title">Nome: A–Z</option>
              <option value="title-desc">Nome: Z–A</option>
              <option value="artist">Artista: A–Z</option>
            </LibrarySelect>
          </div>
          <div className="repertoire-filter-summary">
            <span>
              <Music2 size={15} />{' '}
              {availableInstruments.length === 1
                ? instrumentName(availableInstruments[0])
                : 'Sua coleção'}
            </span>
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
                  <h2>{activeSetlist ? 'Músicas do setlist' : 'Seu repertório'}</h2>
                  <span>Escolha uma música para abrir os materiais.</span>
                </div>
                <p aria-live="polite">
                  <span>
                    {filtered.length} {filtered.length === 1 ? 'música' : 'músicas'}
                  </span>
                </p>
              </div>
              {filtered.length > 0 && (
                <div className="repertoire-table-wrap">
                  <table className="repertoire-table">
                    <caption className="sr-only">
                      Músicas, áudios e partituras da sua biblioteca
                    </caption>
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
                      {filtered.map((song) => {
                        const audio = song.assets.some((asset) => asset.kind === 'audio')
                        const score = song.assets.some((asset) => asset.kind === 'score')
                        return (
                          <tr
                            key={song.id}
                            className={selectedId === song.id ? 'repertoire-selected' : ''}
                          >
                            <th scope="row">
                              <button
                                className="repertoire-song"
                                onClick={() => openSong(song.id)}
                                aria-label={`Abrir materiais de ${song.title}`}
                                aria-pressed={selectedId === song.id}
                              >
                                <span
                                  className={`repertoire-song-icon ${selectedId === song.id ? 'is-selected' : ''}`}
                                >
                                  {selectedId === song.id ? (
                                    <Check size={18} />
                                  ) : activeSetlist ? (
                                    activeSetlist.songs.indexOf(song) + 1
                                  ) : (
                                    <Music2 size={18} />
                                  )}
                                </span>
                                <span className="repertoire-song-details">
                                  <strong>{song.title}</strong>
                                  <small>
                                    {[song.artist, instrumentName(song.instrument)]
                                      .filter(Boolean)
                                      .join(' · ')}
                                  </small>
                                  <span className="repertoire-inline-style">
                                    {song.style || 'Sem estilo'}
                                  </span>
                                </span>
                              </button>
                            </th>
                            <td className="repertoire-style-column">
                              <span className="repertoire-style">
                                {song.style || 'Não informado'}
                              </span>
                            </td>
                            <td className="repertoire-materials-cell">
                              <div className="repertoire-row-actions">
                                {audio ? (
                                  <button
                                    className="repertoire-action"
                                    onClick={() => openSong(song.id)}
                                    aria-label={`Abrir áudio de ${song.title}`}
                                  >
                                    <Headphones size={17} /> <span>Ouvir</span>
                                  </button>
                                ) : null}
                                {score ? (
                                  <button
                                    className="repertoire-action repertoire-score-action"
                                    onClick={() => openSong(song.id)}
                                    aria-label={`Ver partitura de ${song.title}`}
                                  >
                                    <FileMusic size={17} /> <span>Partitura</span>
                                  </button>
                                ) : (
                                  <span className="repertoire-unavailable">—</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {!filtered.length && (
                <div className="repertoire-empty">
                  <FileMusic size={30} />
                  <h3>
                    {songs.length ? 'Nenhuma música encontrada.' : 'Seu repertório está a caminho.'}
                  </h3>
                  <p>
                    {songs.length
                      ? 'Experimente outro nome ou limpe os filtros.'
                      : data.products.length
                        ? 'Os materiais do seu instrumento ainda não foram publicados. Fale com o suporte informado no e-mail de compra.'
                        : 'Entre com o e-mail da sua compra. Os materiais aparecem aqui após a confirmação do pagamento e a liberação do acesso.'}
                  </p>
                  {songs.length > 0 && (
                    <button className="repertoire-action" onClick={clearFilters}>
                      Ver todo o repertório
                    </button>
                  )}
                </div>
              )}
            </div>
            {selected && (
              <SongWorkspace
                key={selected.id}
                song={selected}
                token={token}
                previewMedia={previewMedia}
                onClose={() => {
                  setSelectedId(null)
                  setFocusMode(false)
                }}
                expanded={focusMode}
                onToggleExpanded={() => setFocusMode((value) => !value)}
                sequence={
                  activeSetlist && selectedPosition >= 0
                    ? {
                        position: selectedPosition + 1,
                        total: activeSetlist.songs.length,
                        previous:
                          selectedPosition > 0
                            ? () => openSong(activeSetlist.songs[selectedPosition - 1].id)
                            : undefined,
                        next:
                          selectedPosition < activeSetlist.songs.length - 1
                            ? () => openSong(activeSetlist.songs[selectedPosition + 1].id)
                            : undefined,
                      }
                    : undefined
                }
              />
            )}
          </div>
        </>
      )}
    </section>
  )
}

function SongWorkspace({
  song,
  token,
  onClose,
  expanded,
  onToggleExpanded,
  sequence,
  previewMedia,
}: {
  song: Song
  token: string
  previewMedia?: Readonly<Record<string, string>>
  onClose: () => void
  expanded: boolean
  onToggleExpanded: () => void
  sequence?: { position: number; total: number; previous?: () => void; next?: () => void }
}) {
  const audios = song.assets.filter((asset) => asset.kind === 'audio')
  const scores = song.assets.filter((asset) => asset.kind === 'score')
  const [audioId, setAudioId] = useState(audios[0]?.id ?? '')
  const [scoreId, setScoreId] = useState(scores[0]?.id ?? '')
  const panel = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const previousFocus = document.activeElement
    heading.current?.focus({ preventScroll: true })
    if (window.matchMedia('(max-width: 1099px)').matches)
      panel.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    return () => {
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true })
    }
  }, [])
  return (
    <section ref={panel} className="repertoire-workspace" aria-label={`Materiais de ${song.title}`}>
      <header>
        <div>
          <span className="eyebrow">
            <BookOpen size={14} /> ÁREA DE ESTUDO
          </span>
          <h2 ref={heading} tabIndex={-1}>
            {song.title}
          </h2>
          <p>
            {[song.artist, instrumentName(song.instrument), song.style].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="repertoire-workspace-actions">
          <button
            className="repertoire-expand"
            onClick={onToggleExpanded}
            aria-label={expanded ? 'Mostrar lista de músicas' : 'Ampliar área de estudo'}
            aria-pressed={expanded}
            title={expanded ? 'Mostrar lista de músicas' : 'Ampliar área de estudo'}
          >
            {expanded ? <ArrowLeft size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={onClose} aria-label="Fechar materiais" title="Fechar materiais">
            <X size={21} />
          </button>
        </div>
      </header>
      {sequence && (
        <nav className="library-setlist-sequence" aria-label="Navegar pelo setlist">
          <button
            className="repertoire-action"
            disabled={!sequence.previous}
            onClick={sequence.previous}
            aria-label="Música anterior do setlist"
          >
            <ArrowLeft size={17} /> Anterior
          </button>
          <span>
            {sequence.position} de {sequence.total}
          </span>
          <button
            className="repertoire-action"
            disabled={!sequence.next}
            onClick={sequence.next}
            aria-label="Próxima música do setlist"
          >
            Próxima <ArrowRight size={17} />
          </button>
        </nav>
      )}
      {audios.length > 0 && (
        <div className="repertoire-audio">
          <div className="repertoire-media-heading">
            <h3>
              <Headphones size={19} /> Áudio
            </h3>
            {audios.length > 1 && (
              <LibrarySelect
                label="Escolher áudio"
                value={audioId}
                onChange={(event) => setAudioId(event.target.value)}
              >
                {audios.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.title}
                  </option>
                ))}
              </LibrarySelect>
            )}
          </div>
          <ProtectedMedia
            key={audioId}
            asset={audios.find((asset) => asset.id === audioId)!}
            token={token}
            previewMedia={previewMedia}
          />
        </div>
      )}
      {scores.length > 0 && (
        <div className="repertoire-score">
          <div className="repertoire-media-heading">
            <h3>
              <FileMusic size={19} /> Partitura
            </h3>
            {scores.length > 1 && (
              <LibrarySelect
                label="Escolher partitura"
                value={scoreId}
                onChange={(event) => setScoreId(event.target.value)}
              >
                {scores.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.title} ({asset.format?.toUpperCase()})
                  </option>
                ))}
              </LibrarySelect>
            )}
          </div>
          <ProtectedMedia
            key={scoreId}
            asset={scores.find((asset) => asset.id === scoreId)!}
            token={token}
            previewMedia={previewMedia}
          />
        </div>
      )}
    </section>
  )
}

function ProtectedMedia({
  asset,
  token,
  previewMedia,
}: {
  asset: MemberAsset
  token: string
  previewMedia?: Readonly<Record<string, string>>
}) {
  const currentToken = useRef(token)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [zoom, setZoom] = useState(100)
  useEffect(() => {
    currentToken.current = token
  }, [token])
  useEffect(() => {
    if (previewMedia) return
    const controller = new AbortController()
    api<{ url: string }>(
      `/library/assets/${asset.id}/view`,
      {
        headers: { Authorization: `Bearer ${currentToken.current}` },
        signal: controller.signal,
      },
      LIBRARY_REQUEST_TIMEOUT_MS,
    )
      .then((result) => {
        if (!controller.signal.aborted) setUrl(result.url)
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : 'Não foi possível abrir o arquivo.')
      })
    return () => controller.abort()
  }, [asset.id, refresh, previewMedia])
  const loadError = useCallback(
    () => setError('Não foi possível carregar o arquivo. Renove o acesso e tente novamente.'),
    [],
  )
  const mediaUrl = previewMedia ? previewMedia[asset.id] : url
  if (previewMedia && !mediaUrl)
    return (
      <div className="public-library-preview-locked">
        <BookOpen size={22} />
        <p>Este {asset.kind === 'audio' ? 'áudio' : 'material'} está na área do aluno.</p>
        <span>
          {asset.kind === 'audio'
            ? 'Os áudios fazem parte do Plano Completo.'
            : 'As partituras estão incluídas nos dois planos.'}{' '}
          Para experimentar agora, abra A Thousand Years nesta demonstração.
        </span>
        <a href="#planos">Conhecer os planos ↗</a>
      </div>
    )
  return (
    <div className="repertoire-media">
      {error ? (
        <p role="alert" className="checkout-error">
          {error}
        </p>
      ) : !mediaUrl ? (
        <p className="repertoire-loading" role="status">
          <LoaderCircle className="checkout-spinner" size={18} /> Abrindo arquivo…
        </p>
      ) : asset.kind === 'audio' ? (
        <audio
          controls
          preload="metadata"
          src={mediaUrl}
          aria-label={asset.title}
          onError={loadError}
          onPlay={(event) =>
            window.dispatchEvent(
              new CustomEvent('music-library-play', { detail: event.currentTarget }),
            )
          }
        />
      ) : asset.format === 'png' ? (
        <>
          <LibrarySelect
            className="repertoire-zoom"
            label="Zoom da partitura"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          >
            <option value={100}>100%</option>
            <option value={150}>150%</option>
            <option value={200}>200%</option>
          </LibrarySelect>
          <div className="repertoire-image">
            <img
              src={mediaUrl}
              alt={asset.title}
              style={{ width: `${zoom}%` }}
              onError={loadError}
            />
          </div>
        </>
      ) : (
        <Suspense fallback={<p role="status">Preparando partitura…</p>}>
          <ScorePdf key={mediaUrl} url={mediaUrl} title={asset.title} onError={loadError} />
        </Suspense>
      )}
      {!previewMedia && (
        <div className="repertoire-media-footer">
          <button
            onClick={() => {
              setUrl('')
              setError('')
              setRefresh((value) => value + 1)
            }}
          >
            <RefreshCw size={14} /> {error ? 'Tentar novamente' : 'Renovar acesso ao arquivo'}
          </button>
          {url && !error && asset.kind === 'score' && (
            <a href={url} target="_blank" rel="noreferrer">
              Abrir partitura em nova aba ↗
            </a>
          )}
        </div>
      )}
    </div>
  )
}
