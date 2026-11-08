import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  FileMusic,
  ListMusic,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import {
  MAX_SETLIST_SONGS,
  setlistSongId,
  type CustomSetlist,
  type SetlistSong,
} from '../../shared/custom-setlists'
import { api, LIBRARY_REQUEST_TIMEOUT_MS } from '../lib/api'
import { normalizeSearch } from '../data/library'
import { allInstruments } from '../data/content'
import '../styles/custom-setlists.css'

type AvailableSong = SetlistSong & { id: string }
type Draft = { id?: string; title: string; songs: SetlistSong[] }

function songDescription(song: SetlistSong) {
  return [
    song.artist,
    allInstruments.find((item) => item.id === song.instrument)?.name ?? song.instrument,
  ]
    .filter(Boolean)
    .join(' · ')
}

export function CustomSetlists({
  songs,
  token,
  onOpenSong,
}: {
  songs: AvailableSong[]
  token: string
  onOpenSong: (id: string) => void
}) {
  const [setlists, setSetlists] = useState<CustomSetlist[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const editing = Boolean(draft)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const available = useMemo(() => new Map(songs.map((song) => [song.id, song])), [songs])
  const active = setlists.find((setlist) => setlist.id === activeId)
  const draftIds = new Set(draft?.songs.map(setlistSongId))
  const unavailable = draft?.songs.some((song) => !available.has(setlistSongId(song)))
  const matches = songs.filter((song) =>
    normalizeSearch(`${song.title} ${song.artist}`).includes(normalizeSearch(search.trim())),
  )

  useEffect(() => {
    const controller = new AbortController()
    api<{ setlists: CustomSetlist[] }>(
      '/library/setlists',
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      },
      LIBRARY_REQUEST_TIMEOUT_MS,
    )
      .then((result) => {
        if (!controller.signal.aborted) setSetlists(result.setlists)
      })
      .catch((reason: Error) => {
        if (!controller.signal.aborted) setLoadError(reason.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [token, reload])

  useEffect(() => {
    heading.current?.focus()
  }, [activeId, editing])

  function edit(setlist?: CustomSetlist) {
    setDraft(setlist ? { ...setlist, songs: [...setlist.songs] } : { title: '', songs: [] })
    setSearch('')
    setError('')
    setNotice('')
    setConfirmDelete(false)
  }
  function move(index: number, direction: number) {
    if (!draft) return
    const reordered = [...draft.songs]
    ;[reordered[index], reordered[index + direction]] = [
      reordered[index + direction],
      reordered[index],
    ]
    setDraft({ ...draft, songs: reordered })
  }
  async function save(event: FormEvent) {
    event.preventDefault()
    if (!draft || busy || unavailable || !draft.title.trim() || !draft.songs.length) return
    setBusy(true)
    setError('')
    try {
      const saved = await api<CustomSetlist>(
        `/library/setlists${draft.id ? `/${draft.id}` : ''}`,
        {
          method: draft.id ? 'PUT' : 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: draft.title.trim(),
            songs: draft.songs.map(({ title, artist, instrument }) => ({
              title,
              artist,
              instrument,
            })),
          }),
        },
        LIBRARY_REQUEST_TIMEOUT_MS,
      )
      setSetlists((items) => [saved, ...items.filter((item) => item.id !== saved.id)])
      setActiveId(saved.id)
      setDraft(null)
      setNotice('Setlist salvo na sua conta.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar o setlist.')
    } finally {
      setBusy(false)
    }
  }
  async function remove() {
    if (!active || busy) return
    setBusy(true)
    setError('')
    try {
      await api(
        `/library/setlists/${active.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
        LIBRARY_REQUEST_TIMEOUT_MS,
      )
      setSetlists((items) => items.filter((item) => item.id !== active.id))
      setActiveId(null)
      setConfirmDelete(false)
      setNotice('Setlist excluído.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível excluir o setlist.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="custom-setlists" aria-labelledby="custom-setlists-heading">
      <header className="custom-setlists-heading">
        <div>
          {(draft || active) && (
            <button
              className="repertoire-clear"
              disabled={busy}
              onClick={() => {
                setDraft(null)
                setActiveId(null)
                setError('')
                setNotice('')
                setConfirmDelete(false)
              }}
            >
              <ArrowLeft size={16} /> Voltar aos meus setlists
            </button>
          )}
          <h2 id="custom-setlists-heading" ref={heading} tabIndex={-1}>
            {draft
              ? draft.id
                ? 'Editar setlist'
                : 'Novo setlist'
              : (active?.title ?? 'Meus setlists')}
          </h2>
          <p>
            {draft
              ? 'Escolha as músicas e organize a ordem da sua apresentação.'
              : active
                ? `${active.songs.length} músicas na sua ordem. Abra uma música para estudar.`
                : 'Monte seu repertório e acesse seus setlists em qualquer dispositivo com sua conta.'}
          </p>
        </div>
        {!draft && !active && (
          <button
            className="repertoire-action custom-primary"
            disabled={loading || Boolean(loadError)}
            onClick={() => edit()}
          >
            <Plus size={17} /> Criar setlist
          </button>
        )}
        {active && !draft && (
          <div className="custom-actions">
            <button className="repertoire-action" disabled={busy} onClick={() => edit(active)}>
              <Pencil size={16} /> Editar setlist
            </button>
            <button
              className="repertoire-action"
              disabled={busy}
              onClick={() => {
                setConfirmDelete(true)
                setNotice('')
              }}
            >
              <Trash2 size={16} /> Excluir setlist
            </button>
          </div>
        )}
      </header>
      {loading && <p role="status">Carregando seus setlists…</p>}
      {loadError && (
        <div className="custom-feedback">
          <p role="alert">{loadError}</p>
          <button
            className="repertoire-action"
            onClick={() => {
              setLoading(true)
              setLoadError('')
              setReload((value) => value + 1)
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}
      {error && (
        <p className="checkout-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="custom-feedback" role="status">
          {notice}
        </p>
      )}
      {confirmDelete && active && !draft && (
        <div className="custom-feedback" role="group" aria-label="Confirmar exclusão">
          <p>Excluir “{active.title}”? As músicas continuam na sua biblioteca.</p>
          <div className="custom-actions">
            <button className="repertoire-action" disabled={busy} onClick={remove}>
              {busy ? 'Excluindo…' : 'Confirmar exclusão'}
            </button>
            <button
              className="repertoire-action"
              disabled={busy}
              onClick={() => setConfirmDelete(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {draft ? (
        <form onSubmit={save}>
          <fieldset className="custom-editor" disabled={busy}>
            <legend className="sr-only">Personalizar setlist</legend>
            <div className="custom-name">
              <label htmlFor="custom-setlist-title">Nome do setlist</label>
              <input
                id="custom-setlist-title"
                value={draft.title}
                required
                maxLength={100}
                placeholder="Ex.: Casamento da Ana e do Pedro"
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              />
            </div>
            <div className="custom-editor-columns">
              <section className="custom-panel" aria-labelledby="custom-available-heading">
                <h3 id="custom-available-heading">Adicionar músicas</h3>
                <label className="sr-only" htmlFor="custom-song-search">
                  Buscar músicas para adicionar
                </label>
                <input
                  id="custom-song-search"
                  type="search"
                  placeholder="Busque por música ou artista…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <p>{matches.length} músicas disponíveis no seu acesso</p>
                <ul className="custom-available-list">
                  {matches.map((song) => (
                    <li key={song.id}>
                      <span className="custom-song-label">
                        <strong>{song.title}</strong>
                        <small>{songDescription(song)}</small>
                      </span>
                      <button
                        type="button"
                        className="repertoire-action"
                        aria-label={`Adicionar ${song.title} de ${song.artist || 'artista não informado'}`}
                        disabled={draftIds.has(song.id) || draft.songs.length >= MAX_SETLIST_SONGS}
                        onClick={() =>
                          setDraft({
                            ...draft,
                            songs: [
                              ...draft.songs,
                              {
                                title: song.title,
                                artist: song.artist,
                                instrument: song.instrument,
                              },
                            ],
                          })
                        }
                      >
                        <Plus size={16} /> {draftIds.has(song.id) ? 'Adicionada' : 'Adicionar'}
                      </button>
                    </li>
                  ))}
                </ul>
                {!matches.length && <p>Nenhuma música encontrada. Experimente outro nome.</p>}
              </section>
              <section className="custom-panel" aria-labelledby="custom-order-heading">
                <h3 id="custom-order-heading">
                  Ordem do setlist{' '}
                  <span>
                    ({draft.songs.length}/{MAX_SETLIST_SONGS})
                  </span>
                </h3>
                <p>Use as setas para mudar a ordem.</p>
                {unavailable && (
                  <p className="checkout-error" role="alert">
                    Remova as músicas indisponíveis no seu acesso antes de salvar.
                  </p>
                )}
                {!draft.songs.length && (
                  <p className="custom-empty">
                    Adicione a primeira música para começar seu setlist.
                  </p>
                )}
                <ol className="custom-song-list" aria-label="Ordem das músicas">
                  {draft.songs.map((song, index) => (
                    <li key={setlistSongId(song)}>
                      <span className="custom-song-number">{index + 1}</span>
                      <span className="custom-song-label">
                        <strong>{song.title}</strong>
                        <small>{songDescription(song)}</small>
                        {!available.has(setlistSongId(song)) && (
                          <small>Indisponível no seu acesso</small>
                        )}
                      </span>
                      <div className="custom-order-actions">
                        <button
                          type="button"
                          aria-label={`Mover ${song.title} para cima`}
                          disabled={index === 0}
                          onClick={() => move(index, -1)}
                        >
                          <ArrowUp size={17} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Mover ${song.title} para baixo`}
                          disabled={index === draft.songs.length - 1}
                          onClick={() => move(index, 1)}
                        >
                          <ArrowDown size={17} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Remover ${song.title}`}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              songs: draft.songs.filter((_, position) => position !== index),
                            })
                          }
                        >
                          <X size={17} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
            <footer className="custom-actions">
              <button
                className="repertoire-action custom-primary"
                type="submit"
                disabled={!draft.title.trim() || !draft.songs.length || unavailable}
              >
                {busy ? 'Salvando…' : 'Salvar setlist'}
              </button>
              <button
                className="repertoire-action"
                type="button"
                onClick={() => {
                  setDraft(null)
                  setError('')
                }}
              >
                Cancelar edição
              </button>
            </footer>
          </fieldset>
        </form>
      ) : active ? (
        <ol
          className="custom-song-list custom-saved-songs"
          aria-label="Músicas do setlist personalizado"
        >
          {active.songs.map((song, index) => {
            const current = available.get(setlistSongId(song))
            return (
              <li key={setlistSongId(song)}>
                <span className="custom-song-number">{index + 1}</span>
                <span className="custom-song-label">
                  <strong>{song.title}</strong>
                  <small>{songDescription(song)}</small>
                </span>
                {current ? (
                  <button
                    className="repertoire-action"
                    aria-label={`Abrir materiais de ${song.title}`}
                    onClick={() => onOpenSong(current.id)}
                  >
                    <FileMusic size={17} /> Abrir
                  </button>
                ) : (
                  <span className="repertoire-unavailable">Indisponível no seu acesso</span>
                )}
              </li>
            )
          })}
        </ol>
      ) : (
        !loading &&
        !loadError && (
          <>
            {!setlists.length && (
              <div className="custom-empty">
                <ListMusic size={30} />
                <h3>Seu repertório, do seu jeito.</h3>
                <p>Crie seu primeiro setlist para um show, uma cerimônia ou seus estudos.</p>
              </div>
            )}
            <div className="library-setlist-grid">
              {setlists.map((setlist) => (
                <button
                  className="library-setlist-card"
                  key={setlist.id}
                  aria-label={`Abrir meu setlist ${setlist.title}`}
                  onClick={() => {
                    setActiveId(setlist.id)
                    setNotice('')
                    setError('')
                  }}
                >
                  <span className="library-setlist-card-top">
                    <ListMusic size={18} /> Personalizado
                  </span>
                  <strong>{setlist.title}</strong>
                  <span className="library-setlist-preview">
                    {setlist.songs
                      .slice(0, 3)
                      .map((song) => song.title)
                      .join(' · ')}
                  </span>
                  <span className="library-setlist-card-footer">
                    {setlist.songs.length} músicas · Abrir setlist
                  </span>
                </button>
              ))}
            </div>
          </>
        )
      )}
    </section>
  )
}
