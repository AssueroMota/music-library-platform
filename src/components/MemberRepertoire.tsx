import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { FileMusic, Headphones, LoaderCircle, RefreshCw, Search, X } from 'lucide-react'
import type { MemberAsset, MemberLibraryData } from '../../shared/library'
import { api } from '../lib/api'
import { allInstruments as instruments } from '../data/content'
import { normalizeSearch } from '../data/library'

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

export function MemberRepertoire({ data, token }: { data: MemberLibraryData; token: string }) {
  const [search, setSearch] = useState('')
  const [instrument, setInstrument] = useState('')
  const [style, setStyle] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
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
  const styles = [...new Set(songs.map((song) => song.style).filter(Boolean))].sort()
  const availableInstruments = [...new Set(songs.map((song) => song.instrument))]
  const filtered = songs.filter(
    (song) =>
      (!instrument || song.instrument === instrument) &&
      (!style || song.style === style) &&
      normalizeSearch(`${song.title} ${song.artist}`).includes(normalizeSearch(search.trim())),
  )
  const selected = songs.find((song) => song.id === selectedId)
  const hasFilters = Boolean(search || instrument || style)

  return (
    <section className="repertoire" aria-label="Repertório disponível">
      <div className="repertoire-filters">
        <label className="repertoire-search">
          <Search size={19} aria-hidden="true" />
          <span className="sr-only">Buscar música ou artista</span>
          <input
            type="search"
            placeholder="Buscar música ou artista"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          <span>Instrumento</span>
          <select value={instrument} onChange={(event) => setInstrument(event.target.value)}>
            <option value="">Todos os instrumentos</option>
            {availableInstruments.map((id) => (
              <option key={id} value={id}>
                {instrumentName(id)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Estilo</span>
          <select value={style} onChange={(event) => setStyle(event.target.value)}>
            <option value="">Todos os estilos</option>
            {styles.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        {hasFilters && (
          <button
            className="repertoire-clear"
            onClick={() => {
              setSearch('')
              setInstrument('')
              setStyle('')
            }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="repertoire-heading">
        <h2>Seu repertório</h2>
        <p aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'música' : 'músicas'}
        </p>
      </div>
      {songs.length > 0 && (
        <div className="repertoire-table-wrap">
          <table className="repertoire-table">
            <caption className="sr-only">Músicas, áudios e partituras da sua biblioteca</caption>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Estilo</th>
                <th scope="col">Áudio</th>
                <th scope="col">Partitura</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((song) => {
                const audio = song.assets.some((asset) => asset.kind === 'audio')
                const score = song.assets.some((asset) => asset.kind === 'score')
                return (
                  <tr key={song.id} className={selectedId === song.id ? 'repertoire-selected' : ''}>
                    <th scope="row">
                      <strong>{song.title}</strong>
                      <small>
                        {[song.artist, instrumentName(song.instrument)].filter(Boolean).join(' · ')}
                      </small>
                    </th>
                    <td>
                      <span className="repertoire-style">{song.style || 'Não informado'}</span>
                    </td>
                    <td>
                      {audio ? (
                        <button
                          className="repertoire-action"
                          onClick={() => setSelectedId(song.id)}
                          aria-label={`Abrir áudio de ${song.title}`}
                        >
                          <Headphones size={17} /> Ouvir
                        </button>
                      ) : (
                        <span className="repertoire-unavailable">—</span>
                      )}
                    </td>
                    <td>
                      {score ? (
                        <button
                          className="repertoire-action"
                          onClick={() => setSelectedId(song.id)}
                          aria-label={`Ver partitura de ${song.title}`}
                        >
                          <FileMusic size={17} /> Ver partitura
                        </button>
                      ) : (
                        <span className="repertoire-unavailable">—</span>
                      )}
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
          <h3>{songs.length ? 'Nenhuma música encontrada.' : 'Seu repertório está a caminho.'}</h3>
          <p>
            {songs.length
              ? 'Experimente outro nome ou limpe os filtros.'
              : data.products.length
                ? 'Os materiais do seu instrumento ainda não foram publicados. Fale com o suporte informado no e-mail de compra.'
                : 'Entre com o e-mail da sua compra. Os materiais aparecem aqui após a confirmação do pagamento e a liberação do acesso.'}
          </p>
        </div>
      )}
      {selected && (
        <SongWorkspace
          key={selected.id}
          song={selected}
          token={token}
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
}: {
  song: Song
  token: string
  onClose: () => void
}) {
  const audios = song.assets.filter((asset) => asset.kind === 'audio')
  const scores = song.assets.filter((asset) => asset.kind === 'score')
  const [audioId, setAudioId] = useState(audios[0]?.id ?? '')
  const [scoreId, setScoreId] = useState(scores[0]?.id ?? '')
  return (
    <section className="repertoire-workspace" aria-label={`Materiais de ${song.title}`}>
      <header>
        <div>
          <span className="eyebrow">HORA DE TOCAR</span>
          <h2>{song.title}</h2>
          <p>
            {[song.artist, instrumentName(song.instrument), song.style].filter(Boolean).join(' · ')}
          </p>
        </div>
        <button onClick={onClose} aria-label="Fechar materiais">
          <X size={21} />
        </button>
      </header>
      {audios.length > 0 && (
        <div className="repertoire-audio">
          <div className="repertoire-media-heading">
            <h3>
              <Headphones size={19} /> Áudio
            </h3>
            {audios.length > 1 && (
              <label>
                <span className="sr-only">Escolher áudio</span>
                <select value={audioId} onChange={(event) => setAudioId(event.target.value)}>
                  {audios.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <ProtectedMedia
            key={audioId}
            asset={audios.find((asset) => asset.id === audioId)!}
            token={token}
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
              <label>
                <span className="sr-only">Escolher partitura</span>
                <select value={scoreId} onChange={(event) => setScoreId(event.target.value)}>
                  {scores.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.title} ({asset.format?.toUpperCase()})
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <ProtectedMedia
            key={scoreId}
            asset={scores.find((asset) => asset.id === scoreId)!}
            token={token}
          />
        </div>
      )}
    </section>
  )
}

function ProtectedMedia({ asset, token }: { asset: MemberAsset; token: string }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [zoom, setZoom] = useState(100)
  useEffect(() => {
    const controller = new AbortController()
    api<{ url: string }>(`/library/assets/${asset.id}/view`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) setUrl(result.url)
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : 'Não foi possível abrir o arquivo.')
      })
    return () => controller.abort()
  }, [asset.id, token, refresh])
  const loadError = useCallback(
    () => setError('Não foi possível carregar o arquivo. Renove o acesso e tente novamente.'),
    [],
  )
  return (
    <div className="repertoire-media">
      {error ? (
        <p role="alert" className="checkout-error">
          {error}
        </p>
      ) : !url ? (
        <p className="repertoire-loading" role="status">
          <LoaderCircle className="checkout-spinner" size={18} /> Abrindo arquivo…
        </p>
      ) : asset.kind === 'audio' ? (
        <audio controls preload="metadata" src={url} aria-label={asset.title} onError={loadError} />
      ) : asset.format === 'png' ? (
        <>
          <label className="repertoire-zoom">
            Zoom da partitura
            <select value={zoom} onChange={(event) => setZoom(Number(event.target.value))}>
              <option value={100}>100%</option>
              <option value={150}>150%</option>
              <option value={200}>200%</option>
            </select>
          </label>
          <div className="repertoire-image">
            <img src={url} alt={asset.title} style={{ width: `${zoom}%` }} onError={loadError} />
          </div>
        </>
      ) : (
        <Suspense fallback={<p role="status">Preparando partitura…</p>}>
          <ScorePdf key={url} url={url} title={asset.title} onError={loadError} />
        </Suspense>
      )}
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
    </div>
  )
}
