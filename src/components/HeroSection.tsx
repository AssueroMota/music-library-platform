import { ArrowDown, Heart, Mic2, Play, UtensilsCrossed } from 'lucide-react'
import { violinPresentation } from '../data/violin-sales'
import { PresentationVideo } from './PresentationVideo'
import { Button, Container } from './ui'

export function HeroSection({ onFree }: { onFree: () => void }) {
  const { videoSrc, poster } = violinPresentation

  return (
    <section id="inicio" className="violin-hero" aria-labelledby="hero-title">
      <Container className="hero-intro">
        <h1 id="hero-title">
          Partituras <span>para violino.</span>
        </h1>

        {videoSrc ? (
          <PresentationVideo src={videoSrc} poster={poster} />
        ) : (
          <figure id="apresentacao" className="presentation-player">
            <img className="presentation-backdrop" src={poster} alt="" />
            <figcaption className="presentation-unavailable">
              Vídeo de apresentação em breve.
            </figcaption>
          </figure>
        )}

        <p className="hero-description">
          Monte seu repertório. O Plano Completo inclui playbacks e{' '}
          <a href="#partituras-guiadas">partituras guiadas em vídeo</a>.
        </p>
        <div className="hero-cta">
          <Button href="#planos">Conhecer os planos</Button>
          <p>Pagamento único · Acesso por e-mail</p>
        </div>
        <div className="hero-shortcuts">
          <button type="button" onClick={onFree}>
            Testar a biblioteca de graça <ArrowDown size={15} aria-hidden="true" />
          </button>
          <a href="#demonstracao">
            <Play size={14} aria-hidden="true" /> Ouvir demonstração
          </a>
        </div>
      </Container>

      <div className="occasion-strip">
        <Container>
          <span>
            <Heart size={18} aria-hidden="true" /> CASAMENTOS
          </span>
          <span>
            <UtensilsCrossed size={18} aria-hidden="true" /> RESTAURANTES
          </span>
          <span>
            <Mic2 size={18} aria-hidden="true" /> EVENTOS E APRESENTAÇÕES
          </span>
          <a href="#ocasioes">
            Imagine seu próximo palco <ArrowDown size={15} aria-hidden="true" />
          </a>
        </Container>
      </div>
    </section>
  )
}
