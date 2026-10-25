import {
  ArrowDown,
  Check,
  FileMusic,
  Headphones,
  Play,
  UtensilsCrossed,
  Heart,
  Mic2,
} from 'lucide-react'
import { plans } from '../data/content'
import { Button, Container, Logo, Reveal } from './ui'

export function HeroSection() {
  return (
    <section id="inicio" className="hero violin-hero">
      <Container>
        <header className="sales-nav">
          <Logo light />
          <nav aria-label="Navegação principal">
            <a href="#ocasioes">Onde sua música chega</a>
            <a href="#material">O que você recebe</a>
            <a href="/biblioteca">Já sou cliente ↗</a>
          </nav>
          <a className="nav-offer" href="#planos">
            Escolher meu plano <ArrowDown size={14} />
          </a>
        </header>
        <div className="hero-grid">
          <Reveal className="hero-copy">
            <h1>
              Seu violino.
              <br />O som dos
              <br />
              <span>
                grandes
                <br className="hero-mobile-break" /> momentos.
              </span>
            </h1>
            <p>
              Na entrada da noiva. No jantar especial. Na apresentação que fica na memória. Prepare
              suas interpretações com{' '}
              <strong>partituras para violino e a opção com playbacks.</strong>
            </p>
            <div className="hero-actions">
              <Button href="#planos">Quero preparar meu próximo repertório</Button>
              <a className="hero-listen" href="#demonstracao">
                <Play size={15} fill="currentColor" /> Ouvir demonstração
              </a>
            </div>
            <div className="hero-offer-price">
              <span>
                25 partituras por{' '}
                <strong>
                  {plans[0].price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </strong>
              </span>
              <span className="hero-payment-note">Compra única. Sem mensalidade.</span>
            </div>
            <div className="hero-assurances">
              <span>
                <Check size={14} /> Exclusivo para violino
              </span>
              <span>
                <Check size={14} /> Material digital
              </span>
              <span>
                <Check size={14} /> Acesso por e-mail
              </span>
            </div>
          </Reveal>
          <Reveal className="hero-stage" delay={0.1}>
            <div className="hero-stage-orbit" aria-hidden="true" />
            <figure className="hero-event-photo">
              <img
                src="/images/violin-event.jpg"
                alt="Violinista de traje social tocando em uma celebração com decoração de flores"
                width="1400"
                height="2100"
                fetchPriority="high"
              />
            </figure>
            <div className="hero-kit">
              <div className="kit-cover">
                <FileMusic size={23} />
                <span>MUSIC LIBRARY</span>
                <strong>VIOLINO</strong>
                <small>
                  PARTITURAS
                  <br />+ PLAYBACKS
                </small>
                <div className="kit-score" aria-hidden="true">
                  𝄞 &nbsp; ♪ &nbsp; ♫ &nbsp; ♪
                </div>
              </div>
              <div className="kit-description">
                <span>SUA PREPARAÇÃO COMEÇA AQUI</span>
                <strong>
                  Abra a partitura.
                  <br />
                  Dê o play. Toque.
                </strong>
                <div className="kit-wave" aria-hidden="true">
                  {[10, 19, 13, 29, 22, 37, 16, 25, 35, 18, 28, 12, 21, 31, 15, 25, 12].map(
                    (height, index) => (
                      <i key={index} style={{ height }} />
                    ),
                  )}
                </div>
                <small>
                  <Headphones size={12} /> Playbacks no Plano Completo
                </small>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
      <div className="occasion-strip">
        <Container>
          <span>
            <Heart size={18} /> CASAMENTOS
          </span>
          <span>
            <UtensilsCrossed size={18} /> RESTAURANTES
          </span>
          <span>
            <Mic2 size={18} /> EVENTOS E APRESENTAÇÕES
          </span>
          <a href="#ocasioes">
            Imagine seu próximo palco <ArrowDown size={15} />
          </a>
        </Container>
      </div>
    </section>
  )
}
