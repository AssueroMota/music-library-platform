import { ArrowDown, Check, Headphones, Play, UtensilsCrossed, Heart, Mic2 } from 'lucide-react'
import { plans } from '../data/content'
import { Button, Container } from './ui'
import { guidedScoreCount } from '../../shared/guided-scores'
import { normalScoreCount, totalScoreCount } from '../../shared/score-catalog'

export function HeroSection({ onFree }: { onFree: () => void }) {
  return (
    <section id="inicio" className="hero violin-hero">
      <Container>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>
              Partituras{' '}
              <br />
              <span>para violino.</span>
            </h1>
            <p>
              Monte seu repertório para casamentos, jantares e eventos. No Plano Completo, ensaie com{' '}
              <strong>playbacks e partituras guiadas em vídeo.</strong>
            </p>
            <div className="hero-actions">
              <Button href="#planos">Quero preparar meu próximo repertório</Button>
              <button className="hero-free-button" type="button" onClick={onFree}>
                Testar a biblioteca de graça <ArrowDown size={16} />
              </button>
              <a className="hero-listen" href="#demonstracao">
                <Play size={15} fill="currentColor" /> Ouvir demonstração
              </a>
            </div>
            <div className="hero-offer-price">
              <span className="hero-catalog-total">
                <strong>{totalScoreCount} partituras para violino</strong> no Plano Completo
              </span>
              <span className="hero-catalog-breakdown">
                {normalScoreCount} partituras + {guidedScoreCount} guiadas em vídeo
              </span>
              <span>
                Básico com {normalScoreCount} partituras por{' '}
                <strong>
                  {plans[0].price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </strong>
              </span>
              <span className="hero-payment-note">
                Acesso vitalício. Compra única, sem mensalidade.
              </span>
              <a className="hero-guided-bonus" href="#partituras-guiadas">
                <Play size={15} /> Bônus no Completo: {guidedScoreCount} partituras guiadas em vídeo
                ↗
              </a>
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
          </div>
          <div className="hero-stage">
            <div className="hero-stage-orbit" aria-hidden="true" />
            <figure className="hero-event-photo">
              <img
                src="/images/violin-event.webp"
                alt="Violinista de traje social tocando em uma celebração com decoração de flores"
                width="1200"
                height="1800"
                fetchPriority="high"
                decoding="async"
              />
            </figure>
            <div className="hero-kit">
              <img
                className="kit-cover"
                src="/images/collections/violin-main-v2.webp"
                alt="Livro Music Library: partituras para violino"
                width="1086"
                height="1448"
                decoding="async"
              />
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
          </div>
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
