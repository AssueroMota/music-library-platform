import { ArrowDown, CircleCheck, Gift } from 'lucide-react'
import { Container } from './ui'
import { ProductArtwork, type ArtworkKind } from './ProductArtwork'
import '../styles/offer-contents.css'
import { guidedScoreCount } from '../../shared/guided-scores'
import {
  normalScoreCount,
  totalScoreCount,
  playbackCount,
  scoreCountForStyles,
} from '../../shared/score-catalog'

const bonusCollections: { kind: ArtworkKind; title: string; text: string }[] = [
  {
    kind: 'gospel',
    title: `${scoreCountForStyles('Gospel')} partituras Gospel`,
    text: 'Canções de fé e adoração para tocar em igrejas, cerimônias e celebrações especiais.',
  },
  {
    kind: 'mpb',
    title: `${scoreCountForStyles('MPB')} partituras MPB`,
    text: 'A música brasileira no seu violino: de Tom Jobim e Toquinho a Alceu Valença e Tribalistas.',
  },
  {
    kind: 'international',
    title: `${scoreCountForStyles('Pop internacional')} partituras de Pop Internacional`,
    text: 'Melodias de artistas como Coldplay, Ed Sheeran e Elvis Presley para ampliar o seu repertório.',
  },
  {
    kind: 'classics',
    title: `${scoreCountForStyles('Clássico', 'Trilha sonora')} partituras de Clássicos & Trilhas`,
    text: 'De Canon in D a Cinema Paradiso: clássicos e temas marcantes do cinema para emocionar.',
  },
]

export function OfferContents() {
  return (
    <section
      id="o-que-voce-recebe"
      className="offer-contents"
      aria-labelledby="offer-contents-title"
    >
      <Container>
        <header className="contents-heading">
          <span className="contents-eyebrow">SEU PRÓXIMO REPERTÓRIO COMEÇA AQUI</span>
          <h2 id="offer-contents-title">
            Veja tudo o que
            <br />
            você <em>recebe.</em>
          </h2>
        </header>
        <div className="contents-summary">
          <div className="contents-package">
            <img
              className="contents-bundle"
              src="/images/collections/violin-complete-bundle-151.webp"
              alt={`Pacote digital Music Library: ${totalScoreCount} partituras para violino no total, sendo ${normalScoreCount} partituras e ${guidedScoreCount} guiadas em vídeo, com playbacks`}
              width="1536"
              height="1024"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="contents-summary-card">
            <span className="contents-card-label">NO PLANO COMPLETO</span>
            <h3>
              Partitura na estante.
              <br />
              Playback no seu ensaio.
              <br />
              <em>Seu violino em cena.</em>
            </h3>
            <ul>
              {[
                `${totalScoreCount} partituras no total: ${normalScoreCount} partituras + ${guidedScoreCount} guiadas em vídeo`,
                `${playbackCount} playbacks para acompanhar sua interpretação`,
                '42 setlists organizados para diferentes ocasiões',
                `${guidedScoreCount} guiadas já incluídas nas ${totalScoreCount} partituras`,
                'Coleções por estilo: Gospel, MPB, Internacional e Clássicos & Trilhas',
                'Partituras e acompanhamentos na mesma biblioteca',
                'Acesso vitalício, com pagamento único',
                'Link pessoal de acesso enviado por e-mail',
              ].map((benefit) => (
                <li key={benefit}>
                  <CircleCheck size={18} aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <p className="contents-more">E MUITO MAIS...</p>
            <a href="#planos">
              Encontre o plano para você <ArrowDown size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
        <article className="contents-guided-bonus" id="partituras-guiadas">
          <div className="contents-guided-visual" aria-hidden="true">
            <ProductArtwork kind="guided" />
          </div>
          <div>
            <span className="contents-badge">
              <Gift size={15} /> NOVO BÔNUS DO PLANO COMPLETO
            </span>
            <h2>{guidedScoreCount} vídeos para acompanhar a partitura e tocar junto.</h2>
            <p>
              Veja a partitura passando na tela enquanto a música toca. Pause nos trechos que
              precisam de atenção, volte quantas vezes quiser e estude no seu ritmo.
            </p>
            <p>Uma aba só para suas partituras guiadas, ao lado de Partituras e Setlists.</p>
            <a href="#planos">
              Quero esse bônus na minha biblioteca <ArrowDown size={16} />
            </a>
          </div>
        </article>
        <div className="contents-highlights" id="bonus">
          <header className="contents-heading">
            <span className="contents-badge">
              <Gift size={15} aria-hidden="true" /> COLEÇÕES BÔNUS DO PLANO COMPLETO
            </span>
            <h2>
              Seu repertório ganha
              <br />
              <em>4 coleções bônus.</em>
            </h2>
            <p>Gospel, MPB, Internacional e Clássicos & Trilhas para o seu violino.</p>
          </header>
          <div className="contents-highlights-grid">
            {bonusCollections.map((collection, index) => (
              <article className="contents-highlight" key={collection.kind}>
                <div className="contents-highlight-number">
                  BÔNUS #{String(index + 1).padStart(2, '0')}
                </div>
                <ProductArtwork kind={collection.kind} />
                <div className="contents-highlight-copy">
                  <h3>{collection.title}</h3>
                  <p>{collection.text}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="contents-note">
            As coleções por estilo fazem parte das {normalScoreCount} partituras. Jazz, Natal, rock
            e chanson também estão no acervo. As {guidedScoreCount} guiadas completam o total de{' '}
            {totalScoreCount} partituras do Completo. Páginas extras e playbacks não aumentam essa
            contagem.
          </p>
        </div>
      </Container>
    </section>
  )
}
