import { FileMusic, FileAudio, Star, X } from 'lucide-react'
import { instruments } from '../data/content'
import { fileTypes } from '../data/library'
import type { LibraryFile } from '../types'
import { AudioPlayer } from './AudioPlayer'
import { Score } from './Score'

export function LibraryFiles({
  files,
  view,
  favorites,
  selectedId,
  onOpen,
  onFavorite,
}: {
  files: LibraryFile[]
  view: 'list' | 'grid'
  favorites: Set<string>
  selectedId: string | null
  onOpen: (file: LibraryFile, trigger: HTMLButtonElement) => void
  onFavorite: (id: string) => void
}) {
  return (
    <div className={`browser-files browser-files-${view}`}>
      {view === 'list' && (
        <div className="browser-list-labels" aria-hidden="true">
          <span>Nome</span>
          <span>Tipo</span>
          <span>Tonalidade</span>
          <span />
        </div>
      )}
      <ul>
        {files.map((file) => {
          const Icon = file.kind === 'score' ? FileMusic : FileAudio
          const favoriteLabel = `${file.name} (${fileTypes[file.kind]})`
          return (
            <li
              className={`browser-file ${selectedId === file.id ? 'browser-file-selected' : ''}`}
              key={file.id}
            >
              <button
                className="browser-file-open"
                onClick={(event) => onOpen(file, event.currentTarget)}
                aria-label={`Abrir ${file.kind === 'score' ? 'partitura' : 'áudio'} ${file.name}`}
                aria-pressed={selectedId === file.id}
              >
                <span className={`browser-file-icon file-icon-${file.kind}`}>
                  <Icon size={23} />
                </span>
                <span className="browser-file-name">
                  <strong>{file.name}</strong>
                  <small>
                    {instruments.find((item) => item.id === file.track.instrument)?.name} ·{' '}
                    {file.track.style}
                  </small>
                </span>
                <span className="browser-file-type">{fileTypes[file.kind]}</span>
                <span className="browser-file-key">{file.track.key}</span>
              </button>
              <button
                className="browser-star"
                onClick={() => onFavorite(file.id)}
                aria-pressed={favorites.has(file.id)}
                aria-label={`${favorites.has(file.id) ? 'Remover' : 'Adicionar'} ${favoriteLabel} ${favorites.has(file.id) ? 'dos' : 'aos'} favoritos`}
              >
                <Star size={17} fill={favorites.has(file.id) ? 'currentColor' : 'none'} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function LibraryFilePreview({ file, onClose }: { file: LibraryFile; onClose: () => void }) {
  return (
    <section className="browser-preview" aria-label="Prévia do arquivo">
      <div className="browser-preview-header">
        <h3>Prévia do arquivo</h3>
        <button aria-label="Fechar prévia" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="browser-preview-name">
        <span>{fileTypes[file.kind]}</span>
        <h4>{file.name}</h4>
      </div>
      {file.kind === 'score' ? (
        <Score
          title={file.track.title}
          notes={file.track.scoreNotes}
          bpm={file.track.bpm}
          keyLabel={file.track.key}
        />
      ) : (
        <div className="browser-audio-art">
          <FileAudio size={54} strokeWidth={1.2} />
          <span>ÁUDIO DE DEMONSTRAÇÃO</span>
        </div>
      )}
      <div className="browser-preview-metadata">
        <span>{file.track.key}</span>
        <span>{file.track.bpm} BPM</span>
      </div>
      <p className="browser-preview-caption">
        {file.kind === 'score'
          ? 'Partitura ilustrativa em clave de Sol. Ouça o acompanhamento abaixo.'
          : 'Acompanhamento original com timbre sintetizado.'}
      </p>
      <AudioPlayer
        key={file.id}
        src={file.track.audio.backing}
        label={`acompanhamento de ${file.track.title}`}
        compact
      />
    </section>
  )
}
