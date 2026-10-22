import { AudioLines, CheckCircle2, FolderOpen, Music2 } from 'lucide-react'
import { plans } from '../data/content'
import type { Plan } from '../types'
import { Button, Container, Reveal, SectionHeading } from './ui'

function PlanArtwork({ complete }: { complete: boolean }) {
  return (
    <div className={`pricing-artwork ${complete ? 'artwork-complete' : ''}`}>
      {complete ? (
        <img
          src="/images/music-library-bundle.webp"
          alt="Apresentação ilustrativa da coleção completa Music Library"
          width="1672"
          height="941"
          loading="lazy"
        />
      ) : (
        <div className="basic-plan-art" aria-hidden="true">
          <div className="basic-plan-book">
            <AudioLines size={28} />
            <span>MUSIC LIBRARY</span>
            <strong>
              PARTITURAS
              <br />& BASES
            </strong>
            <Music2 size={37} strokeWidth={1.2} />
            <small>
              SEU INSTRUMENTO.
              <br />
              SEU REPERTÓRIO.
            </small>
          </div>
          <div className="basic-plan-folder">
            <FolderOpen size={34} strokeWidth={1.2} />
            <strong>SUA BIBLIOTECA</strong>
            <span>EM PASTAS</span>
          </div>
        </div>
      )}
    </div>
  )
}

function PlanPrice({ price }: { price?: number }) {
  return (
    <div className="pricing-price">
      {price !== undefined ? (
        <strong className="pricing-value">
          <span>R$</span>
          {price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </strong>
      ) : (
        <strong className="pricing-coming-soon">Em breve</strong>
      )}
      <span className="pricing-price-caption">
        {price === undefined ? 'Valores e condições no lançamento' : 'Valor do plano'}
      </span>
    </div>
  )
}

function PricingCard({
  plan,
  onInfo,
}: {
  plan: Plan
  onInfo: (title: string, text: string) => void
}) {
  const label = `Quero o ${plan.name}`
  return (
    <article
      id={`plano-${plan.id}`}
      className={`pricing-card ${plan.featured ? 'pricing-featured' : ''}`}
      tabIndex={-1}
    >
      {plan.featured && <span className="pricing-ribbon">MAIS POSSIBILIDADES</span>}
      <header className="pricing-card-heading">
        <span className="pricing-mode">{plan.accessMode}</span>
        <h3>{plan.name}</h3>
      </header>
      <PlanArtwork complete={Boolean(plan.featured)} />
      <ul className="pricing-benefits">
        {plan.benefits.map((benefit) => (
          <li key={benefit}>
            <CheckCircle2 size={15} />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      <PlanPrice price={plan.price} />
      {plan.checkoutUrl ? (
        <Button href={plan.checkoutUrl}>{label}</Button>
      ) : (
        <Button
          onClick={() =>
            onInfo(
              plan.name,
              `${plan.description} Valor: ${plan.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'a definir'}. As vendas ainda não estão abertas. O acesso será disponibilizado no lançamento.`,
            )
          }
        >
          {label}
        </Button>
      )}
    </article>
  )
}

export function PricingSection({ onInfo }: { onInfo: (title: string, text: string) => void }) {
  return (
    <section id="planos" className="pricing-section section-space">
      <Container>
        <SectionHeading
          eyebrow="ESCOLHA O SEU ACESSO"
          center
          title={
            <>
              ESCOLHA O PLANO IDEAL
              <br />
              <em>PARA VOCÊ.</em>
            </>
          }
        />
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 0.1}>
              <PricingCard plan={plan} onInfo={onInfo} />
            </Reveal>
          ))}
        </div>
        <p className="pricing-disclaimer">Valores de lançamento. Vendas ainda não abertas.</p>
      </Container>
    </section>
  )
}
