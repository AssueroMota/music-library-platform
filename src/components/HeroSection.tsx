import { Play } from 'lucide-react'
import { plans } from '../data/content'
import { Button, Container, Logo, Reveal } from './ui'

export function HeroSection() {
  const prices = plans.flatMap((plan) => (plan.price === undefined ? [] : [plan.price]))
  const startingPrice = Math.min(...prices)
  return (
    <section id="inicio" className="hero">
      <Container>
        <div className="hero-grid">
          <Reveal className="hero-copy">
            <div className="hero-brand">
              <Logo light />
            </div>
            <h1>
              <span>Partituras e bases.</span>
              <br />
              Para o seu
              <br />
              próximo palco.
            </h1>
            <p>
              Escolha seu instrumento e tenha as partituras e os acompanhamentos organizados em um
              só lugar.
            </p>
            {prices.length > 0 && (
              <div className="hero-offer-price">
                <span>Planos a partir de</span>
                <strong>
                  {startingPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </strong>
              </div>
            )}
            <div className="hero-actions">
              <Button href="#planos">Escolher meu plano</Button>
              <a className="hero-listen" href="#demonstracao">
                <span>
                  <Play size={12} fill="currentColor" />
                </span>
                Ouvir uma amostra
              </a>
            </div>
            <span className="hero-instrument-list">
              Violino · Saxofone · Flauta · Violão · Viola · Violoncelo
            </span>
          </Reveal>
          <Reveal className="hero-mockup-wrap" delay={0.15}>
            <div className="product-visual">
              <div className="product-halo" aria-hidden="true" />
              <img
                className="hero-product-image"
                src="/images/music-library-bundle.webp"
                width="1672"
                height="941"
                fetchPriority="high"
                alt="Composição ilustrativa da Music Library com coleções digitais, instrumentos, partitura e tablet"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
