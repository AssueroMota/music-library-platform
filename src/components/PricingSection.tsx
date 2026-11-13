import { Check, FileMusic, LockKeyhole, Mail, Sparkles, X } from 'lucide-react'
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
        <h3>
          {plan.featured ? totalScoreCount : normalScoreCount} partituras
          {plan.featured && <span>+ Playbacks</span>}
        </h3>
      </header>
      <ProductArtwork kind={plan.featured ? 'complete' : 'basic'} />
      <ul className="pricing-benefits">
        {(plan.featured
          ? [
              `${normalScoreCount} partituras normais + ${guidedScoreCount} guiadas em vídeo`,
              `${playbackCount} playbacks para tocar junto`,
              '42 setlists prontos',
              `${guidedScoreCount} guiadas incluídas no total de ${totalScoreCount}`,
              '4 coleções bônus por estilo',
              'Acesso vitalício',
              'Link pessoal por e-mail',
            ]
          : [
              `${normalScoreCount} partituras normais para violino`,
              '10 setlists prontos',
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
              <span className="free-plan-label">VERSÃO DE TESTE</span>
              <h3>Grátis</h3>
            </header>
            <ProductArtwork kind="basic" />
            <ul className="pricing-benefits">
              {[
                `${freeLibrary.scoreCount} partituras para violino`,
                `${freeLibrary.scoreCount} playbacks para experimentar`,
                `${freeLibrary.guidedScoreCount} partituras guiadas em vídeo`,
                'Link pessoal por e-mail',
                'Sem setlists prontos',
                'Sem setlists personalizados',
              ].map((benefit) => (
                <li key={benefit}>
                  {benefit.startsWith('Sem setlists') ? (
                    <X size={17} className="plan-excluded" aria-hidden="true" />
                  ) : (
                    <Check size={17} aria-hidden="true" />
                  )}
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
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
          Grátis: {freeLibrary.scoreCount} partituras normais + {freeLibrary.guidedScoreCount}{' '}
          guiadas para experimentar, sem setlists. Completo: {normalScoreCount} partituras normais +{' '}
          {guidedScoreCount} guiadas = {totalScoreCount} partituras. Básico: {normalScoreCount}{' '}
          partituras normais. Páginas extras e playbacks não entram nessa soma. Confira o repertório
          e o valor final no checkout.
        </p>
      </Container>
    </section>
  )
}
