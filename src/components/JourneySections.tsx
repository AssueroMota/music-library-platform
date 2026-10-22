import { ArrowRight, Check, FolderOpen, Minus, Music2, ShoppingBag } from 'lucide-react'
import { Button, Container, Reveal, SectionHeading } from './ui'

export function HowItWorks() {
  const steps = [
    {
      icon: FolderOpen,
      title: 'Escolha sua biblioteca.',
      text: 'Encontre o instrumento ou repertório que combina com a sua rotina musical.',
    },
    {
      icon: ShoppingBag,
      title: 'Adquira seu acesso.',
      text: 'No lançamento, escolha a modalidade e conclua a compra em um checkout integrado.',
    },
    {
      icon: Music2,
      title: 'Entre. Explore. Toque.',
      text: 'Após a confirmação, o acesso será liberado e as orientações chegarão por e-mail.',
    },
  ]
  return (
    <section id="como-funciona" className="how-section section-space">
      <Container>
        <SectionHeading
          eyebrow="MENOS ETAPAS. MAIS MÚSICA."
          center
          title={
            <>
              Da escolha à primeira nota.
              <br />
              <em>Simples assim.</em>
            </>
          }
        />
        <div className="steps-grid">
          {steps.map((step, i) => (
            <Reveal className="step-card" key={step.title} delay={i * 0.1}>
              <div className="step-top">
                <span>0{i + 1}</span>
                <step.icon size={25} strokeWidth={1.4} />
                {i !== 2 && <ArrowRight className="step-arrow" size={20} />}
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Reveal>
          ))}
        </div>
        <p className="process-note">
          Fluxo planejado para o lançamento. Compra, liberação automática e envio de e-mail ainda
          não estão disponíveis.
        </p>
        <Reveal className="journey-cta">
          <h3>
            O PRÓXIMO PALCO
            <br />
            <em>COMEÇA NA PREPARAÇÃO.</em>
          </h3>
          <p>Conheça o projeto e descubra como queremos simplificar a sua rotina musical.</p>
          <Button href="#biblioteca">Quero conhecer a Music Library</Button>
        </Reveal>
      </Container>
    </section>
  )
}

export function ComparisonSection() {
  const before = [
    'Procurar arquivos em vários sites',
    'Organizar PDFs manualmente',
    'Alternar entre aplicativos para ouvir áudios',
    'Montar repertórios do zero',
    'Perder tempo procurando tonalidades',
  ]
  const after = [
    'Uma biblioteca centralizada',
    'Partituras organizadas e fáceis de encontrar',
    'Acompanhamentos associados às músicas',
    'Repertórios por ocasião',
    'Filtros por instrumento, estilo e tonalidade',
  ]
  return (
    <section className="comparison-section section-space">
      <Container>
        <div className="comparison-layout">
          <SectionHeading
            eyebrow="ORGANIZAÇÃO QUE INSPIRA"
            title={
              <>
                Uma nova forma de
                <br />
                <em>organizar sua música.</em>
              </>
            }
          >
            Menos arquivos espalhados. Mais clareza para transformar preparação em performance.
            <br />
            <br />
            <span className="subtle-note">Esta é a experiência que estamos construindo.</span>
          </SectionHeading>
          <div className="comparison-panels">
            <div className="comparison-before">
              <span className="comparison-label">A ROTINA QUE VOCÊ CONHECE</span>
              <h3>Método tradicional</h3>
              <ul>
                {before.map((item) => (
                  <li key={item}>
                    <Minus size={15} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="comparison-after">
              <span className="comparison-label">A NOSSA PROPOSTA</span>
              <h3>
                Com Music Library<span>.</span>
              </h3>
              <ul>
                {after.map((item) => (
                  <li key={item}>
                    <Check size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="section-action">
          <Button href="#biblioteca">Explorar a demonstração</Button>
        </div>
      </Container>
    </section>
  )
}
