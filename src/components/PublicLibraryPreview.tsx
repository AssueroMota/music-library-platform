import { BookOpen, Headphones, ShieldCheck } from 'lucide-react'
import type { MemberLibraryData } from '../../shared/library'
import { publicRepertoire } from '../data/public-repertoire'
import { violinDemonstration } from '../data/demonstration'
import { MemberRepertoire } from './MemberRepertoire'
import '../styles/public-library-preview.css'

const data: MemberLibraryData = {
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
            <Headphones size={16} /> Teste a partitura e o playback de A Thousand Years.
          </span>
          <span>
            <ShieldCheck size={16} /> Os demais arquivos são liberados conforme o plano adquirido.
          </span>
        </div>
      </header>
      <MemberRepertoire data={data} token="" previewMedia={previewMedia} />
      <p className="public-library-preview-caption">
        Prévia do catálogo. As quantidades acima representam esta demonstração; a área do aluno
        mostra os arquivos e versões liberados para sua conta.
      </p>
    </section>
  )
}
