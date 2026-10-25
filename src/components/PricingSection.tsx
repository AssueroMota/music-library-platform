import { Check, FileMusic, Headphones, LockKeyhole, Mail, Music2, Sparkles, X } from 'lucide-react'
import { plans } from '../data/content'
import { violinDemonstration } from '../data/demonstration'
import type { Plan } from '../types'
import { Button, Container, Reveal, SectionHeading } from './ui'
import { useOfferPricing } from '../lib/use-offer-pricing'
import { formatBRL } from '../../shared/products'
import { violinLaunch } from '../../shared/violin-launch'
import '../styles/pricing-offer.css'

function ProductArtwork({ complete }: { complete: boolean }) {
  return (
    <div className="offer-art-frame" aria-hidden="true">
      <div className={`offer-art ${complete ? 'offer-art-complete' : ''}`}>
        <div className="offer-art-orbit" />
        {complete && (
          <img
            className="offer-art-musician"
            src="/images/violin-concert-front.jpg"
            alt=""
            width="1200"
            height="800"
            loading="lazy"
          />
        )}
        <img
          className="offer-art-score"
          src={violinDemonstration.score}
          alt=""
          width="658"
          height="897"
          loading="lazy"
        />
        <div className="offer-book">
          <span className="offer-book-spine" />
          <Music2 size={23} strokeWidth={1.4} />
          <span>MUSIC LIBRARY</span>
          <strong>VIOLINO</strong>
          <div className="offer-book-rule" />
          <small>
            PARTITURAS
            {complete && (
              <>
                <br />+ PLAYBACKS
              </>
            )}
          </small>
          <span className="offer-book-edition">SEU REPERTÓRIO. SUA INTERPRETAÇÃO.</span>
        </div>
        {complete ? (
          <div className="offer-audio-tile">
            <Headphones size={24} strokeWidth={1.4} />
            <div>
              <span>ACOMPANHE. INTERPRETE.</span>
              <strong>Seu violino faz a melodia.</strong>
              <div className="offer-audio-bars">
                {[8, 18, 12, 25, 34, 17, 28, 12, 32, 22, 15, 29, 19, 10, 22, 14].map(
                  (height, index) => (
                    <i key={index} style={{ height }} />
                  ),
                )}
              </div>
            </div>
          </div>
        ) : (
          <span className="offer-file-stamp">
            <FileMusic size={16} /> PARTITURAS DIGITAIS
          </span>
        )}
      </div>
    </div>
  )
}

function PricingCard({
  plan,
  onCheckout,
  launchActive,
}: {
  plan: Plan
  onCheckout: (plan: string) => void
  launchActive: boolean
}) {
  return (
    <article
      id={`plano-${plan.id}`}
      className={`pricing-card ${plan.featured ? 'pricing-featured' : ''}`}
      tabIndex={-1}
    >
      {plan.featured && (
        <div className="offer-recommendation">
          <Sparkles size={13} /> RECOMENDADO
        </div>
      )}
      <header className="pricing-card-heading">
        <h3>
          {plan.featured ? (
            <>
              100 partituras <span>+ Playbacks</span>
            </>
          ) : (
            <>25 partituras</>
          )}
        </h3>
      </header>
      <ProductArtwork complete={Boolean(plan.featured)} />
      <ul className="pricing-benefits">
        {(plan.featured
          ? ['Partituras para violino', 'Playbacks para tocar junto', 'Acesso digital por e-mail']
          : ['Partituras para violino', 'Acesso digital por e-mail', 'Sem playbacks']
        ).map((benefit) => (
          <li key={benefit}>
            {benefit.startsWith('Sem ') ? (
              <X size={16} className="plan-excluded" />
            ) : (
              <Check size={16} />
            )}
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      <div className="offer-purchase">
        {plan.featured && launchActive && (
          <div className="offer-launch-price-anchor">
            <span>
              <s>{formatBRL(violinLaunch.regularPriceCents)}</s>
              <small>preço de {violinLaunch.regularFromLabel}</small>
            </span>
          </div>
        )}
        <div className="pricing-price">
          <div>
            <span className="offer-price-kicker">
              {plan.featured && launchActive ? 'NO LANÇAMENTO, POR' : 'POR APENAS'}
            </span>
            <strong className="pricing-value">
              <span>R$</span>
              {plan.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
        <Button onClick={() => onCheckout(plan.id)}>
          {plan.featured ? 'Quero partituras + playbacks' : 'Quero somente as partituras'}
        </Button>
        <span className="offer-checkout-note">Pagamento único · sem mensalidade</span>
      </div>
    </article>
  )
}

export function PricingSection({ onCheckout }: { onCheckout: (plan: string) => void }) {
  const { launchActive, prices } = useOfferPricing()
  const currentPlans = plans.map((plan, index) => ({ ...plan, price: prices[index] / 100 }))
  return (
    <section id="planos" className="pricing-section pricing-showcase pricing-compact section-space">
      <Container>
        <SectionHeading
          center
          title={
            <>
              Escolha seu plano.
              <br />
              <em>Comece a tocar.</em>
            </>
          }
        />
        <div className="pricing-grid">
          {currentPlans.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 0.1}>
              <PricingCard plan={plan} onCheckout={onCheckout} launchActive={launchActive} />
            </Reveal>
          ))}
        </div>
        <div className="pricing-trust">
          <span>
            <LockKeyhole size={16} /> Compra única
          </span>
          <span>
            <Mail size={16} /> Acesso enviado por e-mail
          </span>
          <span>
            <FileMusic size={16} /> Material 100% digital
          </span>
        </div>
        <p className="pricing-disclaimer">
          Acervo em preparação. Confira o repertório disponível e o valor final no checkout.
        </p>
      </Container>
    </section>
  )
}
