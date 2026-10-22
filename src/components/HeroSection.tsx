import { ArrowDown, Check, FileMusic, Headphones, Play, ShieldCheck } from 'lucide-react'
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
              Partituras, backing tracks e repertórios organizados para você{' '}
              <strong>
                estudar melhor, preparar suas apresentações e tocar com mais liberdade.
              </strong>
            </p>
            <ul className="hero-checklist">
              <li>
                <Check size={17} />
                Um projeto para cordas e sopros
              </li>
              <li>
                <Check size={17} />
                Do seu primeiro ensaio ao próximo palco
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
              <div className="product-label label-score">
                <FileMusic size={21} />
                <span>
                  PARTITURA + ÁUDIO<strong>Sua preparação em harmonia.</strong>
                </span>
              </div>
              <div className="product-label label-sound">
                <Headphones size={21} />
                <span>
                  DO ESTUDO AO PALCO<strong>Mais tempo fazendo música.</strong>
                </span>
                <span className="label-equalizer" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <span className="product-caption">
                COMPOSIÇÃO VISUAL DO PROJETO · MATERIAIS EM PREPARAÇÃO
              </span>
            </div>
          </Reveal>
        </div>
        <div className="hero-instruments">
          <span>
            QUAL É O<br />
            <strong>SEU INSTRUMENTO?</strong>
          </span>
          <div>
            Violino
            <i />
            Saxofone
            <i />
            Flauta
            <i />
            Violão
            <i />
            Viola
            <i />
            Violoncelo
          </div>
          <a href="#instrumentos" aria-label="Escolha seu instrumento">
            <ArrowDown size={18} />
          </a>
        </div>
      </Container>
    </section>
  )
}
