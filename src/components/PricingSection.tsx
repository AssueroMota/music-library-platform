import { Check, Layers, LibraryBig, ListMusic } from 'lucide-react'
import { plans } from '../data/content'
import type { Plan } from '../types'
import { Button, Container, Reveal, SectionHeading } from './ui'

function PricingCard({
  plan,
  index,
  onInfo,
}: {
  plan: Plan
  index: number
  onInfo: (title: string, text: string) => void
}) {
  const Icon = [LibraryBig, ListMusic, Layers][index]
  return (
    <article className={`pricing-card ${plan.featured ? 'pricing-featured' : ''}`}>
      {plan.featured && <span className="pricing-ribbon">PARA EXPLORAR MAIS</span>}
      <Icon size={26} strokeWidth={1.5} />
      <span className="pricing-mode">{plan.accessMode}</span>
      <h3>{plan.name}</h3>
      {plan.featured ? (
        <img
          className="pricing-product"
          src="/images/music-library-bundle.webp"
          alt="Composição ilustrativa da coleção completa"
          width="1672"
          height="941"
          loading="lazy"
        />
      ) : (
        <div className={`plan-cover plan-cover-${index}`} aria-hidden="true">
          <span>MUSIC LIBRARY</span>
          <strong>{index === 0 ? 'SEU\nINSTRUMENTO.' : 'SEU\nREPERTÓRIO.'}</strong>
          <Icon size={40} strokeWidth={1.2} />
          <small>COLEÇÃO EM PREPARAÇÃO</small>
        </div>
      )}
      <p>{plan.description}</p>
      <div className="pricing-price">
        {plan.price !== undefined ? (
          <strong>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              plan.price,
            )}
          </strong>
        ) : (
          <strong>Em breve</strong>
        )}
        <span>
          {plan.price === undefined
            ? 'Valores e condições no lançamento'
            : 'Condições de acesso no checkout'}
        </span>
      </div>
      <ul>
        {plan.benefits.map((benefit) => (
          <li key={benefit}>
            <Check size={16} />
            {benefit}
          </li>
        ))}
      </ul>
      {plan.checkoutUrl ? (
        <Button href={plan.checkoutUrl} variant={plan.featured ? 'primary' : 'outline'}>
          Adquirir acesso
        </Button>
      ) : (
        <Button
          variant="primary"
          onClick={() =>
            onInfo(
              plan.accessMode,
              `${plan.name}: ${plan.description} Esta modalidade está em preparação. Os preços, a duração do acesso e as condições serão informados no lançamento. Não há checkout ou cobrança nesta demonstração.`,
            )
          }
        >
          Conhecer a modalidade
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
          eyebrow="UM ACESSO QUE COMBINA COM VOCÊ"
          center
          title={
            <>
              ESCOLHA O CAMINHO
              <br />
              <em>PARA A SUA MÚSICA.</em>
            </>
          }
        >
          Três possibilidades em preparação. Escolha o caminho que faz sentido para a sua jornada.
        </SectionHeading>
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 0.08}>
              <PricingCard plan={plan} index={index} onInfo={onInfo} />
            </Reveal>
          ))}
        </div>
        <p className="pricing-disclaimer">
          Vendas ainda não abertas. Preços, prazo de acesso e conteúdo dos pacotes serão definidos
          antes do lançamento.
        </p>
      </Container>
    </section>
  )
}
