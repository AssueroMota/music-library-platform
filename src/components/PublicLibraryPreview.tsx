import { BookOpen, Headphones, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { MemberLibraryData } from '../../shared/library'
import { publicRepertoire } from '../data/public-repertoire'
import { violinDemonstration } from '../data/demonstration'
import { MemberRepertoire } from './MemberRepertoire'
import '../styles/public-library-preview.css'

const data: MemberLibraryData = {
  setlistLimit: 42,
  products: [],
  assets: publicRepertoire.flatMap(([songTitle, artist, style, audio], index) => {
    const base = { songTitle, artist, style, instrument: 'violin' }
    return [
      {
        ...base,
        id: `demo-score-${index}`,
        title: `${songTitle} - Partitura`,
        kind: 'score',
        format: 'png',
      },
      ...(audio
        ? [
            {
              ...base,
              id: `demo-audio-${index}`,
              title: `${songTitle} - Áudio`,
              kind: 'audio',
              format: 'mp3',
            },
          ]
        : []),
    ]
  }),
}

const sample = publicRepertoire.findIndex(
  ([title, artist]) => title === violinDemonstration.title && artist === violinDemonstration.artist,
)
const previewMedia: Readonly<Record<string, string>> = {
  [`demo-score-${sample}`]: violinDemonstration.score,
  [`demo-audio-${sample}`]: violinDemonstration.backing,
}

export function PublicLibraryPreview() {
  const [basic, setBasic] = useState(false)
  const visibleData: MemberLibraryData = basic
    ? { ...data, setlistLimit: 10, assets: data.assets.filter((asset) => asset.kind === 'score') }
    : data
  return (
    <section
      className="public-library-preview member-page"
      aria-label="Demonstração da biblioteca atual"
    >
      <header className="public-library-preview-heading">
        <span className="public-library-preview-badge">
          <BookOpen size={16} /> EXPLORE A BIBLIOTECA
        </span>
        <h3>Encontre a música. Abra a partitura. Prepare seu repertório.</h3>
        <p>Navegue pela seleção de músicas e pelos setlists no mesmo layout da área do aluno.</p>
        <div className="public-library-preview-notes">
          <span>
            {basic ? <BookOpen size={16} /> : <Headphones size={16} />}
            {basic
              ? 'Teste a partitura de A Thousand Years.'
              : 'Teste a partitura e o playback de A Thousand Years.'}
          </span>
          <span>
            <ShieldCheck size={16} /> Os demais arquivos são liberados conforme o plano adquirido.
          </span>
        </div>
      </header>
      <div
        className="public-library-plan-switch"
        role="group"
        aria-label="Comparar versões da biblioteca"
      >
        <button aria-pressed={basic} onClick={() => setBasic(true)}>
          Básico · Partituras e 10 setlists
        </button>
        <button aria-pressed={!basic} onClick={() => setBasic(false)}>
          Completo · Playbacks e 42 setlists
        </button>
      </div>
      <MemberRepertoire
        key={basic ? 'basic' : 'complete'}
        data={visibleData}
        token=""
        previewMedia={previewMedia}
      />
      <p className="public-library-preview-caption">
        Prévia do catálogo. As quantidades acima representam esta demonstração; a área do aluno
        mostra os arquivos e versões liberados para sua conta.
      </p>
    </section>
  )
}
