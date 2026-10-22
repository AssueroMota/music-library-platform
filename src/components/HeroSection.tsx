import { Check, Play, ShieldCheck } from 'lucide-react'
import { Button, Container, Reveal } from './ui'

export function HeroSection() {
  return (
    <section id="inicio" className="hero">
      <Container>
        <div className="hero-grid">
          <Reveal className="hero-copy">
            <span className="hero-kicker">
              <span />
              DE MÚSICO PARA MÚSICO
            </span>
            <h1>
              <span>Suas partituras.</span>
              <br />
              Seu repertório.
              <br />
              Sua música.
            </h1>
            <p>
              Suas partituras organizadas em pastas por instrumento e repertório.{' '}
              <strong>
                Encontre a música, abra a partitura e tenha o acompanhamento no mesmo lugar.
              </strong>
            </p>
            <ul className="hero-checklist">
              <li>
                <Check size={17} />
                Pastas por instrumento, arquivos por música
              </li>
              <li>
                <Check size={17} />
                Busca, favoritos e visualização dos materiais
              </li>
            </ul>
            <div className="hero-actions">
              <Button href="#biblioteca">Quero conhecer a biblioteca</Button>
              <a className="hero-listen" href="#demonstracao">
                <span>
                  <Play size={12} fill="currentColor" />
                </span>
                Ouvir uma demonstração
              </a>
            </div>
            <span className="hero-disclaimer">
              <ShieldCheck size={14} />
              Explore a prévia. A biblioteca está em preparação.
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
