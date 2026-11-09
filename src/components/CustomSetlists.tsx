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
  SETLIST_TYPES,
  isSetlistExpired,
  setlistToday,
  type SetlistType,
  setlistSongId,
  type CustomSetlist,
  type SetlistSong,
} from '../../shared/custom-setlists'
import { api, LIBRARY_REQUEST_TIMEOUT_MS } from '../lib/api'
import { useSetlistDraft } from '../lib/use-setlist-draft'
import { normalizeSearch } from '../data/library'
import { allInstruments } from '../data/content'
import '../styles/custom-setlists.css'

type AvailableSong = SetlistSong & { id: string }

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
  const editor = useSetlistDraft(token, (saved) => {
    setSetlists((items) => [saved, ...items.filter((item) => item.id !== saved.id)])
  })
  const { draft, change: setDraft } = editor
  const [today, setToday] = useState(setlistToday)
  const [filter, setFilter] = useState('active')
  const editing = Boolean(draft)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const available = useMemo(() => new Map(songs.map((song) => [song.id, song])), [songs])
  const active = setlists.find((setlist) => setlist.id === activeId)
  const expired = active && isSetlistExpired(active, today)
  const filteredSetlists = setlists.filter(
    (item) =>
      filter === 'all' ||
      (filter === 'expired' ? isSetlistExpired(item, today) : !isSetlistExpired(item, today)),
  )
  const draftIds = new Set(draft?.songs.map(setlistSongId))
  const unavailable = draft?.songs.some((song) => !available.has(setlistSongId(song)))
  const canFinalize =
    draft &&
    draft.title.trim() &&
    draft.songs.length &&
    !unavailable &&
    (draft.type === 'personal' || draft.eventDate)
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

  useEffect(() => {
    const update = () => setToday(setlistToday())
    const timer = window.setInterval(update, 30000)
    window.addEventListener('focus', update)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', update)
    }
  }, [])

  function edit(setlist?: CustomSetlist) {
    editor.edit(setlist)
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
    if (!draft || busy || !canFinalize) return
    setBusy(true)
    const id = draft.id
    if (await editor.close(true)) {
      setActiveId(id)
      setNotice('Setlist salvo na sua conta.')
    }
    setBusy(false)
  }
  async function back() {
    if (draft && !(await editor.close())) return
    setActiveId(null)
    setError('')
    setNotice('')
    setConfirmDelete(false)
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
      <header
        className={`custom-setlists-heading${draft ? ' custom-setlists-heading-editing' : ''}`}
      >
        <div>
          {(draft || active) && (
            <button
              className="repertoire-clear"
              disabled={busy}
              onClick={() => {
                void back()
              }}
            >
              <ArrowLeft size={16} /> Voltar aos meus setlists
            </button>
          )}
          <h2 id="custom-setlists-heading" ref={heading} tabIndex={-1}>
            {draft ? 'Personalizar setlist' : (active?.title ?? 'Meus setlists')}
          </h2>
          <p>
            {draft
              ? 'Escolha as músicas e organize a ordem da sua apresentação.'
              : active
                ? `${active.songs.length} músicas na sua ordem. Abra uma música para estudar.`
                : 'Monte seu repertório e acesse seus setlists em qualquer dispositivo com sua conta.'}
          </p>
        </div>
        {draft && (
          <div className="custom-editor-toolbar">
            <button
              form="custom-setlist-form"
              className="repertoire-action custom-primary"
              type="submit"
              disabled={busy || !canFinalize}
            >
              {busy ? 'Salvando…' : 'Salvar setlist'}
            </button>
            <span role="status" className="custom-save-status">
              {editor.saving
                ? 'Salvando automaticamente…'
                : editor.error
                  ? 'Alterações pendentes. Tente salvar novamente.'
                  : editor.dirty
                    ? 'Alterações pendentes…'
                    : editor.persisted
                      ? 'Salvo automaticamente na sua conta'
                      : 'Salvamento automático ativado'}
            </span>
            {editor.error && (
              <button
                type="button"
                className="repertoire-action"
                disabled={editor.saving}
                onClick={() => {
                  void editor.retry()
                }}
              >
                Tentar salvar rascunho
              </button>
            )}
          </div>
        )}
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
      {(error || editor.error) && (
        <p className="checkout-error" role="alert">
          {error || editor.error}
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
        <form id="custom-setlist-form" onSubmit={save}>
          <fieldset className="custom-editor" disabled={busy}>
            <legend className="sr-only">Personalizar setlist</legend>
            <div className="custom-metadata">
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
              <div className="custom-name">
                <label htmlFor="custom-setlist-type">Tipo do setlist</label>
                <select
                  id="custom-setlist-type"
                  value={draft.type}
                  onChange={(event) => {
                    const type = event.target.value as SetlistType
                    setDraft({
                      ...draft,
                      type,
                      eventDate: type === 'personal' ? null : draft.eventDate,
                    })
                  }}
                >
                  {Object.entries(SETLIST_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="custom-name">
                <label htmlFor="custom-setlist-date">Data do evento</label>
                <input
                  id="custom-setlist-date"
                  type="date"
                  value={draft.eventDate ?? ''}
                  disabled={draft.type === 'personal'}
                  required={draft.type !== 'personal'}
                  onChange={(event) =>
                    setDraft({ ...draft, eventDate: event.target.value || null })
                  }
                  aria-describedby="custom-setlist-expiry"
                />
              </div>
            </div>
            <p id="custom-setlist-expiry" className="custom-expiry-help">
              {draft.type === 'personal'
                ? 'Setlist próprio: sem vencimento. Use para seus estudos e playlists.'
                : 'O setlist fica inativo no dia seguinte à data do evento. Você pode editar a data para reutilizá-lo.'}
            </p>
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
          </fieldset>
        </form>
      ) : active ? (
        <>
          <p className="custom-setlist-summary">
            {SETLIST_TYPES[active.type ?? 'personal']} ·{' '}
            {active.eventDate ? active.eventDate.split('-').reverse().join('/') : 'Sem vencimento'}{' '}
            ·{' '}
            {expired
              ? 'Inativo — evento encerrado'
              : active.status === 'draft'
                ? 'Rascunho'
                : 'Ativo'}
          </p>
          {expired && (
            <p className="custom-feedback">
              A data deste evento já passou. Edite a data para reativar este setlist.
            </p>
          )}
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
                  {current && !expired ? (
                    <button
                      className="repertoire-action"
                      aria-label={`Abrir materiais de ${song.title}`}
                      onClick={() => onOpenSong(current.id)}
                    >
                      <FileMusic size={17} /> Abrir
                    </button>
                  ) : (
                    <span className="repertoire-unavailable">
                      {expired ? 'Evento encerrado' : 'Indisponível no seu acesso'}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </>
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
            <div className="custom-list-filter">
              <label htmlFor="custom-setlist-filter">Exibir setlists</label>
              <select
                id="custom-setlist-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="active">Ativos e rascunhos</option>
                <option value="expired">Inativos</option>
                <option value="all">Todos</option>
              </select>
            </div>
            {setlists.length > 0 && !filteredSetlists.length && (
              <p>Nenhum setlist nesta seleção.</p>
            )}
            <div className="library-setlist-grid">
              {filteredSetlists.map((setlist) => (
                <button
                  className={`library-setlist-card${isSetlistExpired(setlist, today) ? ' custom-setlist-expired' : ''}`}
                  key={setlist.id}
                  aria-label={`Abrir meu setlist ${setlist.title || 'Sem nome'}`}
                  onClick={() => {
                    setActiveId(setlist.id)
                    setNotice('')
                    setError('')
                  }}
                >
                  <span className="library-setlist-card-top">
                    <ListMusic size={18} /> {SETLIST_TYPES[setlist.type ?? 'personal']}
                  </span>
                  <strong>{setlist.title || 'Setlist sem nome'}</strong>
                  <span className="custom-setlist-meta">
                    {setlist.eventDate
                      ? setlist.eventDate.split('-').reverse().join('/')
                      : 'Sem vencimento'}{' '}
                    ·{' '}
                    {isSetlistExpired(setlist, today)
                      ? 'Inativo'
                      : setlist.status === 'draft'
                        ? 'Rascunho'
                        : 'Ativo'}
                  </span>
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
