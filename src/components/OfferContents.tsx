import { ArrowDown, CircleCheck, Gift, Play, Video } from 'lucide-react'
import { Container } from './ui'
import { ProductArtwork, type ArtworkKind } from './ProductArtwork'
import '../styles/offer-contents.css'
import { guidedScoreCount } from '../../shared/guided-scores'

const bonusCollections: { kind: ArtworkKind; title: string; text: string }[] = [
  {
    kind: 'gospel',
    title: '18 partituras Gospel',
    text: 'Canções de fé e adoração para tocar em igrejas, cerimônias e celebrações especiais.',
  },
  {
    kind: 'mpb',
    title: '13 partituras MPB',
    text: 'A música brasileira no seu violino: de Tom Jobim e Toquinho a Alceu Valença e Tribalistas.',
  },
  {
    kind: 'international',
    title: '56 partituras de Pop Internacional',
    text: 'Melodias de artistas como Coldplay, Ed Sheeran e Elvis Presley para ampliar o seu repertório.',
  },
  {
    kind: 'classics',
    title: '10 partituras de Clássicos & Trilhas',
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
              src="/images/collections/violin-complete-bundle.webp"
              alt="Apresentação do pacote digital Music Library: acervo de violino, quatro coleções bônus, partituras e playbacks"
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
                'Coleção em expansão para 100 partituras de violino',
                'Playbacks para acompanhar sua interpretação',
                '42 setlists organizados para diferentes ocasiões',
                `Bônus: ${guidedScoreCount} partituras guiadas em vídeo`,
                'Coleções bônus: Gospel, MPB, Internacional e Clássicos & Trilhas',
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
            <Video size={42} strokeWidth={1.4} />
            <strong>{guidedScoreCount}</strong>
            <span>PARTITURAS GUIADAS</span>
            <div>𝄞 ── ♪ ── ♫ ── ♪</div>
            <Play size={24} />
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
            Apresentação ilustrativa do material digital. A coleção está em expansão; os setlists
            utilizam as músicas disponíveis na biblioteca.
          </p>
        </div>
      </Container>
    </section>
  )
}
