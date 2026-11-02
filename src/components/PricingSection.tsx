import { Check, FileMusic, LockKeyhole, Mail, Sparkles, X } from 'lucide-react'
import { plans } from '../data/content'
import type { Plan } from '../types'
import { Button, Container, SectionHeading } from './ui'
import { ProductArtwork } from './ProductArtwork'
import { useOfferPricing } from '../lib/use-offer-pricing'
import { formatBRL } from '../../shared/products'
import { violinLaunch } from '../../shared/violin-launch'
import { guidedScoreCount } from '../../shared/guided-scores'
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
        <h3>100 partituras{plan.featured && <span>+ Playbacks</span>}</h3>
      </header>
      <ProductArtwork kind={plan.featured ? 'complete' : 'basic'} />
      <ul className="pricing-benefits">
        {(plan.featured
          ? [
              'Partituras para violino',
              'Playbacks para tocar junto',
              '42 setlists prontos',
              `Bônus: ${guidedScoreCount} partituras guiadas em vídeo`,
              '4 coleções bônus por estilo',
              'Acesso vitalício',
              'Link pessoal por e-mail',
            ]
          : [
              'Partituras para violino',
              '10 setlists prontos',
              `Bônus: ${guidedScoreCount} partituras guiadas em vídeo`,
              'Acesso vitalício',
              'Link pessoal por e-mail',
              'Sem playbacks',
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
            {plan.featured && launchActive ? 'NO LANÇAMENTO, POR' : 'POR APENAS'}
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

export function PricingSection({ onCheckout }: { onCheckout: (plan: string) => void }) {
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
        <div className="pricing-grid">
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
            <LockKeyhole size={16} aria-hidden="true" /> Compra única
          </span>
          <span>
            <Mail size={16} aria-hidden="true" /> Acesso enviado por e-mail
          </span>
          <span>
            <FileMusic size={16} aria-hidden="true" /> Material 100% digital
          </span>
        </div>
        <p className="pricing-disclaimer">
          Coleção em expansão para 100 partituras. Os setlists usam os materiais já disponíveis na
          biblioteca. Confira o repertório e o valor final no checkout.
        </p>
      </Container>
    </section>
  )
}
