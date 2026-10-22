import { useMemo, useState } from 'react'
import {
  AudioLines,
  BookOpen,
  Check,
  ChevronRight,
  Heart,
  ListMusic,
  Music2,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { instruments, tracks } from '../data/content'
import type { InstrumentId } from '../types'
import { AudioPlayer } from './AudioPlayer'
import { Score } from './Score'
import { Container, SectionHeading } from './ui'

export function LibraryPreview({
  instrument,
  onInstrumentChange,
}: {
  instrument: InstrumentId
  onInstrumentChange: (id: InstrumentId) => void
}) {
  const [search, setSearch] = useState('')
  const [style, setStyle] = useState('')
  const [key, setKey] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const filtered = useMemo(
    () =>
      tracks.filter(
        (track) =>
          track.instrument === instrument &&
          track.title
            .toLocaleLowerCase('pt-BR')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .includes(
              search
                .toLocaleLowerCase('pt-BR')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ''),
            ) &&
          (!style || track.style === style) &&
          (!key || track.key === key) &&
          (!onlyFavorites || favorites.has(track.id)),
      ),
    [instrument, search, style, key, onlyFavorites, favorites],
  )
  const selected = filtered.find((track) => track.id === selectedId) ?? filtered[0]
  const toggleFavorite = (id: string) =>
    setFavorites((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const reset = () => {
    setSearch('')
    setStyle('')
    setKey('')
    setOnlyFavorites(false)
  }

  return (
    <section id="biblioteca" className="library-section section-space">
      <Container>
        <div className="section-topline">
          <SectionHeading
            eyebrow="UM LUGAR PARA A SUA MÚSICA"
            title={
              <>
                Tudo em harmonia.
                <br />
                <em>Inclusive sua rotina.</em>
              </>
            }
          >
            Explore a ideia da plataforma. Busque um estudo, experimente os filtros e ouça a
            demonstração.
          </SectionHeading>
          <span className="demo-badge">
            <span />
            PRÉVIA INTERATIVA
          </span>
        </div>
        <div className="library-app">
          <aside className="library-sidebar">
            <div className="app-mark">
              <AudioLines size={21} /> music library.
            </div>
            <span className="sidebar-caption">SEU ESPAÇO MUSICAL</span>
            <button
              aria-label="Minha biblioteca"
              className={!onlyFavorites ? 'sidebar-active' : ''}
              onClick={reset}
            >
              <BookOpen size={17} /> Minha biblioteca
            </button>
            <button
              aria-label="Favoritos"
              className={onlyFavorites ? 'sidebar-active' : ''}
              onClick={() => setOnlyFavorites(true)}
            >
              <Heart size={17} /> Favoritos <span className="sidebar-count">{favorites.size}</span>
            </button>
            <div className="sidebar-divider" />
            <span className="sidebar-caption">INSTRUMENTOS</span>
            {instruments.map((item) => (
              <button
                key={item.id}
                className={instrument === item.id ? 'instrument-active' : ''}
                onClick={() => onInstrumentChange(item.id)}
              >
                <Music2 size={15} />
                {item.name}
                {instrument === item.id && <ChevronRight size={14} />}
              </button>
            ))}
            <div className="sidebar-note">
              <ListMusic size={23} />
              <p>Seu próximo repertório começa com uma boa escolha.</p>
              <small>Ambiente de demonstração</small>
            </div>
          </aside>
          <div className="library-main">
            <div className="library-toolbar">
              <div>
                <span className="micro-label">
                  BIBLIOTECA /{' '}
                  {instruments
                    .find((item) => item.id === instrument)
                    ?.name.toLocaleUpperCase('pt-BR')}
                </span>
                <h3>
                  {onlyFavorites ? 'Seus favoritos' : 'Encontre sua próxima música'}
                  <span className="gold-dot">.</span>
                </h3>
              </div>
              <span className="sample-label">DADOS DE EXEMPLO</span>
            </div>
            <div className="library-filters">
              <label className="search-field">
                <Search size={16} />
                <span className="sr-only">Buscar músicas</span>
                <input
                  placeholder="Busque por uma música…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button aria-label="Limpar busca" onClick={() => setSearch('')}>
                    <X size={14} />
                  </button>
                )}
              </label>
              <label>
                <span className="sr-only">Filtrar instrumento</span>
                <select
                  aria-label="Filtrar instrumento"
                  value={instrument}
                  onChange={(event) => onInstrumentChange(event.target.value as InstrumentId)}
                >
                  {instruments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Filtrar estilo</span>
                <select value={style} onChange={(event) => setStyle(event.target.value)}>
                  <option value="">Todos os estilos</option>
                  <option>Contemporâneo</option>
                  <option>Estudo</option>
                </select>
              </label>
              <label>
                <span className="sr-only">Filtrar tonalidade</span>
                <select value={key} onChange={(event) => setKey(event.target.value)}>
                  <option value="">Tonalidade</option>
                  <option>Dó maior</option>
                  <option>Lá menor</option>
                </select>
              </label>
            </div>
            <div className="library-content">
              <div className="track-column">
                <div className="track-list-heading">
                  <span>{onlyFavorites ? 'FAVORITOS' : 'ESTUDOS ORIGINAIS'}</span>
                  <SlidersHorizontal size={14} aria-hidden="true" />
                </div>
                <p className="result-count" aria-live="polite">
                  {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
                </p>
                {filtered.map((track, index) => (
                  <div
                    className={`track-row ${selected?.id === track.id ? 'track-selected' : ''}`}
                    key={track.id}
                  >
                    <button
                      className="track-select"
                      onClick={() => setSelectedId(track.id)}
                      aria-pressed={selected?.id === track.id}
                    >
                      <span className="track-number">
                        {selected?.id === track.id ? <AudioLines size={17} /> : `0${index + 1}`}
                      </span>
                      <span>
                        <strong>{track.title}</strong>
                        <small>
                          {track.style} · {track.key}
                        </small>
                      </span>
                    </button>
                    <button
                      className={`favorite-button ${favorites.has(track.id) ? 'is-favorite' : ''}`}
                      aria-label={`${favorites.has(track.id) ? 'Remover' : 'Adicionar'} ${track.title} ${favorites.has(track.id) ? 'dos' : 'aos'} favoritos`}
                      aria-pressed={favorites.has(track.id)}
                      onClick={() => toggleFavorite(track.id)}
                    >
                      <Heart size={17} fill={favorites.has(track.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                ))}
                {!filtered.length && (
                  <div className="empty-state">
                    <Search size={27} />
                    <strong>Nenhum estudo por aqui.</strong>
                    <p>Experimente outros filtros ou adicione um favorito.</p>
                    <button onClick={reset}>Limpar filtros</button>
                  </div>
                )}
                <div className="local-note">
                  <Check size={14} />
                  <span>Interações locais. Favoritos são reiniciados ao recarregar.</span>
                </div>
              </div>
              <div className="score-column">
                {selected ? (
                  <>
                    <div className="score-column-top">
                      <span>PRÉVIA DA PARTITURA</span>
                      <span>{selected.bpm} BPM</span>
                    </div>
                    <Score
                      title={selected.title}
                      notes={selected.scoreNotes}
                      bpm={selected.bpm}
                      keyLabel={selected.key}
                    />
                    <div className="library-player-title">
                      <span>
                        <Music2 size={13} /> {selected.title}
                      </span>
                      <small>ACOMPANHAMENTO</small>
                    </div>
                    <AudioPlayer
                      key={selected.id}
                      src={selected.audio.backing}
                      label={`acompanhamento de ${selected.title}`}
                      compact
                    />
                  </>
                ) : (
                  <div className="score-placeholder">
                    <BookOpen size={38} />
                    <p>Escolha um estudo para visualizar a partitura.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <p className="demo-disclaimer">
          Demonstração com estudos originais e timbres sintetizados em clave de Sol. Arranjos por
          instrumento, PDFs completos e biblioteca privada fazem parte da próxima fase.
        </p>
      </Container>
    </section>
  )
}
