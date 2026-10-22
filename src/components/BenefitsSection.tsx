import {
  BookOpen,
  CalendarDays,
  CirclePlay,
  FileMusic,
  Heart,
  Layers,
  Search,
  Smartphone,
} from 'lucide-react'
import { Button, Container, Reveal, SectionHeading } from './ui'

const features = [
  {
    icon: FileMusic,
    title: 'Partituras em pastas',
    description: 'Navegue por instrumento e abra as subpastas de partituras e áudios na prévia.',
    current: true,
  },
  {
    icon: CirclePlay,
    title: 'Backing tracks de qualidade',
    description: 'Acompanhamentos associados à música. Ouça os estudos sintetizados nesta página.',
    current: true,
  },
  {
    icon: CalendarDays,
    title: 'Repertórios por ocasião',
    description: 'Do casamento ao restaurante: seleções para os diferentes momentos da sua música.',
    current: false,
  },
  {
    icon: Search,
    title: 'Encontre seus arquivos',
    description:
      'Busque pelo nome da música e filtre os arquivos por instrumento, estilo e tonalidade.',
    current: true,
  },
  {
    icon: Smartphone,
    title: 'Seu espaço, em qualquer tela',
    description: 'Explore esta página no computador, no tablet ou no celular.',
    current: true,
  },
  {
    icon: Heart,
    title: 'Seus arquivos favoritos',
    description:
      'Marque a estrela para reunir os materiais na área de favoritos desta demonstração.',
    current: true,
  },
  {
    icon: Layers,
    title: 'Do estudo à apresentação',
    description: 'Materiais pensados para acompanhar a preparação do primeiro ensaio ao palco.',
    current: false,
  },
  {
    icon: BookOpen,
    title: 'Tudo flui com você',
    description: 'Uma navegação intuitiva para dedicar mais tempo ao que você quer tocar.',
    current: true,
  },
]

export function BenefitsSection() {
  return (
    <section id="recursos" className="benefits-section section-space">
      <Container>
        <SectionHeading
          eyebrow="SUA ROTINA, EM OUTRO RITMO"
          center
          title={
            <>
              Mais tempo tocando.
              <br />
              <em>Menos tempo procurando.</em>
            </>
          }
        >
          A tecnologia cuida da organização. Você cuida da música.
        </SectionHeading>
        <div className="benefit-grid">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 2) * 0.09}>
              <article className="feature-card">
                <feature.icon size={25} strokeWidth={1.5} />
                <span className={`feature-status ${feature.current ? 'status-current' : ''}`}>
                  {feature.current ? 'NA DEMONSTRAÇÃO' : 'RECURSO PLANEJADO'}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="section-action">
          <Button href="#biblioteca">Quero explorar a biblioteca</Button>
        </div>
      </Container>
    </section>
  )
}
