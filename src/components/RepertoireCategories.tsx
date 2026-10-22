import {
  ArrowUpRight,
  BriefcaseBusiness,
  Church,
  Coffee,
  Flower2,
  GraduationCap,
  Heart,
  MicVocal,
  Piano,
} from 'lucide-react'
import { Container, SectionHeading } from './ui'

const occasions = [
  {
    icon: Flower2,
    name: 'Casamentos',
    description: 'Para fazer parte de histórias inesquecíveis.',
  },
  {
    icon: Coffee,
    name: 'Restaurantes',
    description: 'A atmosfera certa, da primeira à última mesa.',
  },
  { icon: Church, name: 'Igrejas', description: 'Música para momentos de fé e comunhão.' },
  {
    icon: BriefcaseBusiness,
    name: 'Eventos corporativos',
    description: 'Elegância que acompanha cada encontro.',
  },
  { icon: Piano, name: 'Música clássica', description: 'Tradição, expressão e novos desafios.' },
  {
    icon: Heart,
    name: 'Música romântica',
    description: 'Melodias que dizem o que palavras não dizem.',
  },
  {
    icon: MicVocal,
    name: 'Música popular',
    description: 'Canções para criar conexão com quem ouve.',
  },
  {
    icon: GraduationCap,
    name: 'Estudos e prática',
    description: 'Um pouco mais de música em cada dia.',
  },
]

export function RepertoireCategories() {
  return (
    <section className="occasion-section section-space" id="repertorios">
      <Container>
        <div className="section-topline">
          <SectionHeading
            eyebrow="PARA CADA PALCO DA VIDA"
            title={
              <>
                O repertório certo.
                <br />
                <em>Para o seu momento.</em>
              </>
            }
          >
            Conheça as categorias que vão orientar a curadoria da futura biblioteca.
          </SectionHeading>
          <span className="section-aside">
            CURADORIA PLANEJADA
            <br />
            PARA DIFERENTES OCASIÕES
          </span>
        </div>
        <div className="occasion-grid">
          {occasions.map((occasion, index) => (
            <article className="occasion-card" key={occasion.name}>
              <div>
                <occasion.icon size={27} strokeWidth={1.4} />
                <span>0{index + 1}</span>
              </div>
              <h3>{occasion.name}</h3>
              <p>{occasion.description}</p>
              <span className="occasion-planned">
                EM PREPARAÇÃO <ArrowUpRight size={13} />
              </span>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
