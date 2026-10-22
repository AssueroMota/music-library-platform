import {
  ArrowDown,
  AudioLines,
  Check,
  FileMusic,
  Headphones,
  Music2,
  ShieldCheck,
} from 'lucide-react'
import { Container, Button, Reveal } from './ui'
import { Score } from './Score'

function HeroMockup() {
  return (
    <div className="hero-visual" aria-label="Composição visual da futura biblioteca">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <span className="visual-cross">+</span>
      <div className="mockup-window">
        <div className="mockup-chrome">
          <div className="window-dots">
            <i />
            <i />
            <i />
          </div>
          <span>SEU ESPAÇO PARA TOCAR</span>
          <span className="mockup-demo">DEMO</span>
        </div>
        <div className="mockup-content">
          <div className="mockup-side">
            <AudioLines size={24} />
            <BookSpine />
            <Music2 size={17} />
            <Headphones size={17} />
          </div>
          <div className="mockup-body">
            <div className="mockup-heading">
              <div>
                <span>BOA MÚSICA, SEM COMPLICAÇÃO</span>
                <h3>Seu momento de tocar.</h3>
              </div>
              <span className="mockup-avatar">ML</span>
            </div>
            <div className="mockup-score-header">
              <span>
                <FileMusic size={13} /> Primeira luz
              </span>
              <span>Dó maior · 80 BPM</span>
            </div>
            <Score />
            <div className="mockup-audio">
              <span className="mockup-play">
                <Music2 size={17} />
              </span>
              <div>
                <strong>Primeira luz</strong>
                <small>Estudo original · acompanhamento</small>
              </div>
              <div className="mini-wave" aria-hidden="true">
                {Array.from({ length: 25 }, (_, i) => (
                  <i key={i} style={{ height: `${12 + ((i * 19) % 21)}px` }} />
                ))}
              </div>
              <span className="mockup-time">0:12</span>
            </div>
          </div>
        </div>
      </div>
      <div className="floating-tag tag-top">
        <span>
          <FileMusic size={19} />
        </span>
        <div>
          <strong>Partitura + backing track</strong>
          <small>Uma experiência integrada</small>
        </div>
        <Check size={15} />
      </div>
      <div className="floating-tag tag-bottom">
        <span>
          <Headphones size={20} />
        </span>
        <div>
          <strong>Menos busca. Mais música.</strong>
          <small>Do estudo ao seu próximo palco.</small>
        </div>
      </div>
      <span className="visual-caption">UMA PRÉVIA DO QUE ESTAMOS CRIANDO</span>
    </div>
  )
}

function BookSpine() {
  return (
    <span className="mockup-nav-active">
      <FileMusic size={17} />
    </span>
  )
}

export function HeroSection() {
  return (
    <section id="inicio" className="hero">
      <Container>
        <div className="hero-grid">
          <Reveal className="hero-copy">
            <span className="eyebrow">
              <i />
              FEITA POR UM MÚSICO. PENSADA PARA VOCÊ.
            </span>
            <h1>
              Suas partituras.
              <br />
              Seu repertório.
              <br />
              <em>Sua música.</em>
            </h1>
            <p>
              Descubra uma biblioteca digital de partituras, acompanhamentos e repertórios
              organizados para estudar, ensaiar e se apresentar com mais liberdade.
            </p>
            <div className="hero-actions">
              <Button href="#biblioteca">Explorar a biblioteca</Button>
              <a className="text-link" href="#recursos">
                Conhecer os recursos <ArrowDown size={16} />
              </a>
            </div>
            <div className="hero-assurance">
              <span>
                <ShieldCheck size={15} /> Projeto em desenvolvimento
              </span>
              <span>
                <Headphones size={15} /> Ouça uma demonstração
              </span>
            </div>
          </Reveal>
          <Reveal className="hero-mockup-wrap">
            <HeroMockup />
          </Reveal>
        </div>
        <div className="hero-instruments">
          <span>
            SEU INSTRUMENTO.
            <br />
            <strong>SEU LUGAR.</strong>
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
