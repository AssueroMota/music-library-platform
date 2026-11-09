import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Check,
  FileMusic,
  Headphones,
  ListMusic,
  Video,
  Music2,
  Search,
  X,
} from 'lucide-react'
import type { MemberAsset, MemberLibraryData } from '../../shared/library'
import { allInstruments as instruments } from '../data/content'
import { normalizeSearch } from '../data/library'
import { LibrarySelect } from './LibrarySelect'
import { LibrarySetlists } from './LibrarySetlists'
import { resolveSetlists } from '../data/setlists'

import { ProtectedMedia } from './ProtectedMedia'
import { LibraryGuidedScores } from './LibraryGuidedScores'
import { StudyDialog } from './StudyDialog'
import { CustomSetlists } from './CustomSetlists'
import { setlistSongId } from '../../shared/custom-setlists'

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
  const [artist, setArtist] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<'songs' | 'setlists' | 'guided' | 'custom'>('songs')
  const [setlistId, setSetlistId] = useState<string | null>(null)
  const setlistHeading = useRef<HTMLHeadingElement>(null)
  const setlistLimit =
    data.setlistLimit ?? (data.assets.some((asset) => asset.kind === 'audio') ? 42 : 10)
  const songs = useMemo(() => {
    const grouped = new Map<string, Song>()
    for (const asset of data.assets) {
      if (asset.kind === 'video') continue
      if (setlistLimit === 10 && asset.kind === 'audio') continue
      const title = asset.songTitle || asset.title
      const id = setlistSongId({ title, artist: asset.artist || '', instrument: asset.instrument })
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
  }, [data.assets, setlistLimit])
  const setlists = useMemo(() => resolveSetlists(songs, setlistLimit), [songs, setlistLimit])
  const activeSetlist =
    view === 'setlists' ? setlists.find((item) => item.id === setlistId) : undefined
  useEffect(() => {
    if (activeSetlist) setlistHeading.current?.focus()
  }, [activeSetlist])
  const collection = activeSetlist?.songs ?? songs
  const collectionStyles = [...new Set(collection.map((song) => song.style).filter(Boolean))].sort()
  const collectionArtists = [
    ...new Set(collection.map((song) => song.artist).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  const availableInstruments = [...new Set(songs.map((song) => song.instrument))]
  const videos = useMemo(
    () => (setlistLimit === 42 ? data.assets.filter((asset) => asset.kind === 'video') : []),
    [data.assets, setlistLimit],
  )
  const filtered = collection
    .filter(
      (song) =>
        (!instrument || song.instrument === instrument) &&
        (!style || song.style === style) &&
        (!artist || song.artist === artist) &&
        normalizeSearch(`${song.title} ${song.artist}`).includes(normalizeSearch(search.trim())),
    )
    .sort((a, b) =>
      activeSetlist
        ? collection.indexOf(a) - collection.indexOf(b)
        : a.title.localeCompare(b.title, 'pt-BR'),
    )
  const selected = songs.find((song) => song.id === selectedId)
  const hasFilters = Boolean(search || instrument || style || artist)
  function clearFilters() {
    setSearch('')
    setInstrument('')
    setStyle('')
    setArtist('')
  }
  function openSong(id: string) {
    setSelectedId(id)
  }
  function changeView(next: 'songs' | 'setlists' | 'guided' | 'custom') {
    setView(next)
    setSetlistId(null)
    setSelectedId(null)
    clearFilters()
  }
  function openSetlist(id: string) {
    setSetlistId(id)
    setSelectedId(null)
    clearFilters()
  }

  return (
    <section className="repertoire" aria-label="Repertório disponível">
      {(songs.length > 0 || videos.length > 0) && (
        <nav className="library-collection-nav" aria-label="Explorar biblioteca">
          <button aria-pressed={view === 'songs'} onClick={() => changeView('songs')}>
            <FileMusic size={18} /> {setlistLimit === 42 ? 'Partituras + Playbacks' : 'Partituras'}{' '}
            <span>{songs.length}</span>
          </button>
          <button aria-pressed={view === 'setlists'} onClick={() => changeView('setlists')}>
            <ListMusic size={18} /> Setlists prontos <span>{setlists.length}</span>
          </button>
          {token && !previewMedia && (
            <button aria-pressed={view === 'custom'} onClick={() => changeView('custom')}>
              <ListMusic size={18} /> Meus setlists
            </button>
          )}
          {setlistLimit === 42 && (
            <button aria-pressed={view === 'guided'} onClick={() => changeView('guided')}>
              <Video size={18} /> Partituras guiadas <span>{videos.length}</span>
            </button>
          )}
        </nav>
      )}
      {view === 'custom' ? (
        <CustomSetlists key={token} songs={songs} token={token} onOpenSong={openSong} />
      ) : view === 'guided' ? (
        <LibraryGuidedScores videos={videos} token={token} previewMedia={previewMedia} />
      ) : view === 'setlists' && !activeSetlist ? (
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
              label="Banda / artista"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
            >
              <option value="">Todas as bandas e artistas</option>
              {collectionArtists.map((name) => (
                <option key={name} value={name}>
                  {name} ({collection.filter((song) => song.artist === name).length})
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
                                    {[
                                      song.artist,
                                      availableInstruments.length > 1
                                        ? instrumentName(song.instrument)
                                        : '',
                                    ]
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
          </div>
        </>
      )}
      {selected && (
        <SongWorkspace
          key={selected.id}
          song={selected}
          token={token}
          previewMedia={previewMedia}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  )
}

function SongWorkspace({
  song,
  token,
  onClose,
  previewMedia,
}: {
  song: Song
  token: string
  previewMedia?: Readonly<Record<string, string>>
  onClose: () => void
}) {
  const audios = song.assets.filter((asset) => asset.kind === 'audio')
  const scores = song.assets.filter((asset) => asset.kind === 'score')
  const [audioId, setAudioId] = useState(audios[0]?.id ?? '')
  const [scoreId, setScoreId] = useState(scores[0]?.id ?? '')
  return (
    <StudyDialog
      title={song.title}
      label={`Materiais de ${song.title}`}
      closeLabel="Fechar materiais"
      onClose={onClose}
    >
      <div className="repertoire-study-body">
        {scores.length === 0 && (
          <div className="repertoire-audio-only">
            <Headphones size={54} strokeWidth={1.2} />
            <h3>{song.title}</h3>
            <p>Ouça o acompanhamento no player abaixo.</p>
          </div>
        )}
        {scores.length > 0 && (
          <div className="repertoire-score">
            {scores.length > 1 && (
              <div className="repertoire-media-heading">
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
              </div>
            )}
            <ProtectedMedia
              key={scoreId}
              asset={scores.find((asset) => asset.id === scoreId)!}
              token={token}
              previewMedia={previewMedia}
              minimal
            />
          </div>
        )}
      </div>
      {audios.length > 0 && (
        <footer className="repertoire-study-player" aria-label="Áudio da partitura">
          <div className="repertoire-audio">
            {audios.length > 1 && (
              <div className="repertoire-media-heading">
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
              </div>
            )}
            <ProtectedMedia
              key={audioId}
              asset={audios.find((asset) => asset.id === audioId)!}
              token={token}
              previewMedia={previewMedia}
              autoPlay
              minimal
            />
          </div>
        </footer>
      )}
    </StudyDialog>
  )
}
