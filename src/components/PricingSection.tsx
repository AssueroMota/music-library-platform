import { Check, FileMusic, LockKeyhole, Mail, Sparkles, X, Headphones, Video } from 'lucide-react'
import { plans } from '../data/content'
import type { Plan } from '../types'
import { Button, Container, SectionHeading } from './ui'
import { ProductArtwork } from './ProductArtwork'
import { useOfferPricing } from '../lib/use-offer-pricing'
import { formatBRL } from '../../shared/products'
import { violinLaunch } from '../../shared/violin-launch'
import { guidedScoreCount } from '../../shared/guided-scores'
import { normalScoreCount, totalScoreCount, playbackCount } from '../../shared/score-catalog'
import { freeLibrary } from '../../shared/free-library'
import '../styles/pricing-offer.css'
import '../styles/offer-contents.css'
import '../styles/pricing-comparison.css'

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
      aria-label={plan.name}
      tabIndex={-1}
    >
      {plan.featured && (
        <div className="comparison-recommendation">
          <Sparkles size={13} aria-hidden="true" /> RECOMENDADO
        </div>
      )}
      <header className="pricing-card-heading">
        <span className="plan-eyebrow">{plan.featured ? 'PLANO COMPLETO' : 'PLANO BÁSICO'}</span>
        <h3>
          Partituras
          {plan.featured && <span>+ Playbacks</span>}
        </h3>
        <p>
          {plan.featured
            ? 'Para estudar e tocar com acompanhamento.'
            : 'Seu repertório, sempre à mão.'}
        </p>
      </header>
      <div className="plan-collection">
        <div className="plan-collection-count">
          <strong>{plan.featured ? totalScoreCount : normalScoreCount}</strong>
          <span>partituras para violino</span>
          {plan.featured && (
            <small>
              {normalScoreCount} partituras + {guidedScoreCount} guiadas
            </small>
          )}
        </div>
        <ProductArtwork kind="basic" />
      </div>
      <ul className="pricing-benefits">
        {(plan.featured
          ? [
              `${playbackCount} playbacks para tocar junto`,
              '42 setlists prontos',
              'Coleções organizadas por estilo',
              'Acesso vitalício',
              'Link pessoal por e-mail',
            ]
          : [
              '10 setlists prontos',
              'Partituras por música e artista',
              'Acesso vitalício',
              'Link pessoal por e-mail',
              'Sem playbacks e vídeos',
            ]
        ).map((benefit) => (
          <li key={benefit}>
            {benefit.startsWith('Sem ') ? (
              <X size={17} className="plan-excluded" aria-hidden="true" />
            ) : (
              <Check size={17} aria-hidden="true" />
            )}
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      <div className="comparison-purchase">
        {plan.featured && launchActive && (
          <div className="comparison-price-anchor">
            <s>{formatBRL(violinLaunch.regularPriceCents)}</s>
            <span>preço de {violinLaunch.regularFromLabel}</span>
          </div>
        )}
        <div className="pricing-price">
          <span className="comparison-price-kicker">
            {plan.featured && launchActive ? 'NO LANÇAMENTO' : 'PAGAMENTO ÚNICO'}
          </span>
          <strong className="pricing-value">
            <span>R$</span>
            {plan.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </strong>
        </div>
        <Button onClick={() => onCheckout(plan.id)}>
          {plan.featured ? 'Quero partituras + playbacks' : 'Quero somente as partituras'}
        </Button>
        <span className="comparison-payment">Acesso vitalício · pagamento único</span>
      </div>
    </article>
  )
}

export function PricingSection({
  onCheckout,
  onFree,
}: {
  onCheckout: (plan: string) => void
  onFree?: () => void
}) {
  const { launchActive, prices } = useOfferPricing()
  const currentPlans = plans.map((plan, index) => ({ ...plan, price: prices[index] / 100 }))
  return (
    <section id="planos" className="pricing-section pricing-comparison section-space">
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
        <div className="pricing-grid pricing-grid-with-free">
          <article
            id="plano-free"
            className="pricing-card pricing-free"
            aria-label="Plano Grátis"
            tabIndex={-1}
          >
            <header className="pricing-card-heading">
              <span className="plan-eyebrow">EXPERIMENTE A BIBLIOTECA</span>
              <h3>Grátis</h3>
              <p>Conheça por dentro antes de escolher.</p>
            </header>
            <div className="free-plan-samples" aria-label="Materiais do teste grátis">
              <span>
                <FileMusic size={18} />
                <strong>{freeLibrary.scoreCount}</strong> partituras
              </span>
              <span>
                <Headphones size={18} />
                <strong>{freeLibrary.scoreCount}</strong> playbacks
              </span>
              <span>
                <Video size={18} />
                <strong>{freeLibrary.guidedScoreCount}</strong> guiadas
              </span>
            </div>
            <ul className="pricing-benefits">
              {['Link pessoal por e-mail', 'Acesso pelo celular ou computador'].map((benefit) => (
                <li key={benefit}>
                  <Check size={17} aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <p className="free-plan-limit">Sem setlists prontos ou personalizados.</p>
            <div className="comparison-purchase">
              <div className="pricing-price">
                <span className="comparison-price-kicker">PARA EXPERIMENTAR</span>
                <strong className="pricing-value">
                  <span>R$</span>0,00
                </strong>
              </div>
              <Button onClick={onFree}>Quero testar de graça</Button>
              <span className="comparison-payment">Sem pagamento ou cartão</span>
            </div>
          </article>
          {currentPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onCheckout={onCheckout}
              launchActive={launchActive}
            />
          ))}
        </div>
        <div className="pricing-trust">
          <span>
            <LockKeyhole size={16} aria-hidden="true" /> Sem mensalidade
          </span>
          <span>
            <Mail size={16} aria-hidden="true" /> Acesso enviado por e-mail
          </span>
          <span>
            <FileMusic size={16} aria-hidden="true" /> Material 100% digital
          </span>
        </div>
        <p className="pricing-disclaimer">
          Grátis: {freeLibrary.scoreCount} partituras + {freeLibrary.guidedScoreCount} guiadas para
          experimentar, sem setlists. Completo: {normalScoreCount} partituras + {guidedScoreCount}{' '}
          guiadas = {totalScoreCount} partituras. Básico: {normalScoreCount} partituras. Páginas
          extras e playbacks não entram nessa soma. Confira o repertório e o valor final no
          checkout.
        </p>
      </Container>
    </section>
  )
}
