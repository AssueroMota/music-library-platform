import { useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  AudioLines,
  ChevronRight,
  Folder,
  FolderOpen,
  Grid2X2,
  List,
  Search,
  Star,
  X,
} from 'lucide-react'
import { instruments } from '../data/content'
import { libraryFiles, normalizeSearch } from '../data/library'
import type { InstrumentId, LibraryFile, LibraryFileKind } from '../types'
import { LibraryFiles, LibraryFilePreview } from './LibraryFiles'
import { Container, SectionHeading } from './ui'

type FolderKind = LibraryFileKind | 'all'

export function LibraryPreview({
  instrument,
  onInstrumentChange,
}: {
  instrument: InstrumentId | null
  onInstrumentChange: (id: InstrumentId | null) => void
}) {
  const [search, setSearch] = useState('')
  const [style, setStyle] = useState('')
  const [key, setKey] = useState('')
  const [kind, setKind] = useState<FolderKind>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [sort, setSort] = useState('asc')
  const previewTrigger = useRef<HTMLButtonElement | null>(null)
  const currentInstrument = instruments.find((item) => item.id === instrument)
  const hasFilters = Boolean(search.trim() || style || key)
  const showFiles = Boolean(instrument || onlyFavorites || hasFilters)
  const showFolders = !onlyFavorites && !hasFilters && kind === 'all'
  const categoryName = kind === 'score' ? 'Partituras' : 'Backing tracks'

  const filtered = useMemo(
    () =>
      libraryFiles
        .filter(
          (file) =>
            (!instrument || file.track.instrument === instrument) &&
            (kind === 'all' || file.kind === kind) &&
            normalizeSearch(file.name).includes(normalizeSearch(search.trim())) &&
            (!style || file.track.style === style) &&
            (!key || file.track.key === key) &&
            (!onlyFavorites || favorites.has(file.id)),
        )
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') * (sort === 'asc' ? 1 : -1)),
    [instrument, kind, search, style, key, onlyFavorites, favorites, sort],
  )
  const selected = filtered.find((file) => file.id === selectedId)

  const clearFilters = () => {
    setSearch('')
    setStyle('')
    setKey('')
    setSelectedId(null)
  }
  const openInstrument = (id: InstrumentId) => {
    onInstrumentChange(id)
    setKind('all')
    setOnlyFavorites(false)
    clearFilters()
  }
  const goRoot = () => {
    onInstrumentChange(null)
    setKind('all')
    setOnlyFavorites(false)
    clearFilters()
  }
  const openFavorites = () => {
    onInstrumentChange(null)
    setKind('all')
    setOnlyFavorites(true)
    clearFilters()
  }
  const goBack = () => {
    clearFilters()
    if (kind !== 'all') setKind('all')
    else goRoot()
  }
  const openFile = (file: LibraryFile, trigger: HTMLButtonElement) => {
    previewTrigger.current = trigger
    setSelectedId(file.id)
  }
  const closePreview = () => {
    setSelectedId(null)
    previewTrigger.current?.focus()
  }
  const toggleFavorite = (id: string) =>
    setFavorites((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <section id="biblioteca" className="library-section section-space">
      <Container>
        <div className="section-topline">
          <SectionHeading
            eyebrow="SUAS PARTITURAS, CADA UMA NO SEU LUGAR"
            title={
              <>
                ORGANIZE EM PASTAS.
                <br />
                <em>ENCONTRE. ABRA. TOQUE.</em>
              </>
            }
          >
            Uma organização familiar: navegue pelas pastas do instrumento, encontre seus arquivos e
            abra a prévia da partitura ou do acompanhamento.
          </SectionHeading>
          <span className="demo-badge">
            <span />
            DEMONSTRAÇÃO DA ORGANIZAÇÃO
          </span>
        </div>
        <div className="file-browser">
          <aside className="browser-sidebar" aria-label="Navegação da biblioteca">
            <div className="browser-brand">
              <AudioLines size={24} />
              <span>music library.</span>
            </div>
            <button
              aria-label="Minha biblioteca"
              className={!onlyFavorites && !instrument ? 'browser-nav-active' : ''}
              onClick={goRoot}
            >
              <FolderOpen size={19} />
              <span>Minha biblioteca</span>
            </button>
            <button
              aria-label="Favoritos"
              className={onlyFavorites ? 'browser-nav-active' : ''}
              onClick={openFavorites}
            >
              <Star size={18} />
              <span>Favoritos</span>
              <small>{favorites.size}</small>
            </button>
            <span className="browser-sidebar-label">PASTAS POR INSTRUMENTO</span>
            {instruments.map((item) => (
              <button
                className={instrument === item.id ? 'browser-nav-active' : ''}
                onClick={() => openInstrument(item.id)}
                key={item.id}
              >
                <Folder size={17} />
                <span>{item.name}</span>
              </button>
            ))}
            <p className="browser-local-note">
              Prévia local com arquivos de exemplo. Favoritos são reiniciados ao recarregar.
            </p>
          </aside>
          <div className="browser-workspace">
            <div className="browser-topbar">
              <label className="browser-search">
                <Search size={19} />
                <span className="sr-only">Buscar arquivos</span>
                <input
                  placeholder="Buscar nas partituras e áudios"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button aria-label="Limpar busca" onClick={() => setSearch('')}>
                    <X size={16} />
                  </button>
                )}
              </label>
              <span className="browser-demo">DEMO</span>
            </div>
            <div className="browser-location">
              <button
                className="browser-back"
                aria-label="Voltar uma pasta"
                disabled={!instrument && !onlyFavorites}
                onClick={goBack}
              >
                <ArrowLeft size={18} />
              </button>
              <nav aria-label="Caminho da pasta">
                <button onClick={goRoot} aria-label="Ir para a raiz">
                  Minha biblioteca
                </button>
                {onlyFavorites && (
                  <>
                    <ChevronRight size={15} />
                    <span aria-current="page">Favoritos</span>
                  </>
                )}
                {currentInstrument && (
                  <>
                    <ChevronRight size={15} />
                    <button
                      onClick={() => {
                        setKind('all')
                        setSelectedId(null)
                      }}
                      aria-current={kind === 'all' ? 'page' : undefined}
                    >
                      {currentInstrument.name}
                    </button>
                  </>
                )}
                {instrument && kind !== 'all' && (
                  <>
                    <ChevronRight size={15} />
                    <span aria-current="page">{categoryName}</span>
                  </>
                )}
              </nav>
            </div>
            <div className="browser-filters">
              <label>
                <span className="sr-only">Filtrar instrumento</span>
                <select
                  aria-label="Filtrar instrumento"
                  value={instrument ?? ''}
                  onChange={(event) => {
                    onInstrumentChange((event.target.value || null) as InstrumentId | null)
                    setKind('all')
                    setSelectedId(null)
                  }}
                >
                  <option value="">Todos os instrumentos</option>
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
                  <option value="">Todas as tonalidades</option>
                  <option>Dó maior</option>
                  <option>Lá menor</option>
                </select>
              </label>
              {hasFilters && (
                <button className="browser-clear" onClick={clearFilters}>
                  Limpar filtros
                </button>
              )}
            </div>
            <div className={`browser-body ${selected ? 'browser-has-preview' : ''}`}>
              <div className="browser-directory">
                {showFolders && (
                  <>
                    <h3 className="browser-section-title">Pastas</h3>
                    <div className="browser-folders">
                      {!instrument
                        ? instruments.map((item) => (
                            <button
                              className="browser-folder"
                              key={item.id}
                              onClick={() => openInstrument(item.id)}
                              aria-label={`Abrir pasta ${item.name}`}
                            >
                              <Folder size={30} fill="currentColor" strokeWidth={1.3} />
                              <strong>{item.name}</strong>
                              <small>2 partituras · 2 áudios de exemplo</small>
                            </button>
                          ))
                        : (['score', 'audio'] as const).map((type) => (
                            <button
                              className={`browser-folder folder-${type}`}
                              key={type}
                              onClick={() => {
                                setKind(type)
                                setSelectedId(null)
                              }}
                              aria-label={`Abrir pasta ${type === 'score' ? 'Partituras' : 'Backing tracks'}`}
                            >
                              <Folder size={30} fill="currentColor" strokeWidth={1.3} />
                              <strong>{type === 'score' ? 'Partituras' : 'Backing tracks'}</strong>
                              <small>2 arquivos de exemplo</small>
                            </button>
                          ))}
                    </div>
                  </>
                )}
                {showFiles ? (
                  <>
                    <div className="browser-files-heading">
                      <div>
                        <h3 className="browser-section-title">
                          {onlyFavorites ? 'Arquivos favoritos' : 'Arquivos'}
                        </h3>
                        <p className="browser-result-count" aria-live="polite">
                          {filtered.length} {filtered.length === 1 ? 'arquivo' : 'arquivos'}
                        </p>
                      </div>
                      <div className="browser-view-controls">
                        <label>
                          <span className="sr-only">Ordenar arquivos</span>
                          <select value={sort} onChange={(event) => setSort(event.target.value)}>
                            <option value="asc">Nome: A–Z</option>
                            <option value="desc">Nome: Z–A</option>
                          </select>
                        </label>
                        <button
                          aria-label="Visualização em lista"
                          aria-pressed={view === 'list'}
                          onClick={() => setView('list')}
                        >
                          <List size={18} />
                        </button>
                        <button
                          aria-label="Visualização em grade"
                          aria-pressed={view === 'grid'}
                          onClick={() => setView('grid')}
                        >
                          <Grid2X2 size={17} />
                        </button>
                      </div>
                    </div>
                    {filtered.length ? (
                      <LibraryFiles
                        files={filtered}
                        view={view}
                        favorites={favorites}
                        selectedId={selectedId}
                        onOpen={openFile}
                        onFavorite={toggleFavorite}
                      />
                    ) : (
                      <div className="browser-empty">
                        <Search size={30} />
                        <strong>Nenhum arquivo encontrado.</strong>
                        <p>
                          {onlyFavorites
                            ? 'Marque a estrela de um arquivo para encontrá-lo aqui.'
                            : 'Experimente outros termos, estilos ou tonalidades.'}
                        </p>
                        {hasFilters && <button onClick={clearFilters}>Limpar filtros</button>}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="browser-root-hint">
                    <FolderOpen size={23} />
                    <p>
                      Abra a pasta do seu instrumento para explorar as partituras e os áudios de
                      exemplo.
                    </p>
                  </div>
                )}
              </div>
              {selected && <LibraryFilePreview file={selected} onClose={closePreview} />}
            </div>
          </div>
        </div>
        <p className="demo-disclaimer">
          Prévia de navegação por pastas e arquivos, inspirada na familiaridade de um gerenciador de
          documentos. Estudos ilustrativos e áudio sintetizado; PDFs completos, upload, movimentação
          de arquivos e armazenamento em nuvem serão integrados futuramente.
        </p>
      </Container>
    </section>
  )
}
