import { AudioLines, Check, FileMusic, Headphones, ListMusic, Search } from 'lucide-react'
import { Button, Container, Reveal, SectionHeading } from './ui'

const materials = [
  {
    icon: FileMusic,
    label: 'PARTITURAS',
    title: 'Cada nota no seu lugar.',
    description: 'Materiais organizados para transformar sua preparação em música.',
    cover: 'PARTITURAS\nPARA TOCAR MAIS',
    className: 'cover-score',
  },
  {
    icon: Headphones,
    label: 'ACOMPANHAMENTOS',
    title: 'Uma base para ir além.',
    description: 'Backing tracks associados aos materiais, do estudo à apresentação.',
    cover: 'SEU SOM\nEM PRIMEIRO PLANO',
    className: 'cover-audio',
  },
  {
    icon: ListMusic,
    label: 'REPERTÓRIOS',
    title: 'Um som para cada ocasião.',
    description: 'Seleções planejadas para casamentos, restaurantes, igrejas e outros eventos.',
    cover: 'REPERTÓRIOS\nCOM PROPÓSITO',
    className: 'cover-repertoire',
  },
  {
    icon: Search,
    label: 'ORGANIZAÇÃO',
    title: 'Encontre. Prepare. Toque.',
    description: 'Filtros e navegação para encontrar o que combina com seu momento.',
    cover: 'SUA BIBLIOTECA\nEM HARMONIA',
    className: 'cover-library',
  },
]

export function CollectionShowcase() {
  return (
    <section className="collection-section section-space" id="colecao">
      <Container>
        <Reveal className="collection-summary">
          <img
            className="collection-product"
            src="/images/music-library-bundle.webp"
            alt="Apresentação visual da futura coleção Music Library"
            loading="lazy"
            width="1672"
            height="941"
          />
          <div className="collection-summary-card">
            <span className="eyebrow">UMA BIBLIOTECA. MUITAS POSSIBILIDADES.</span>
            <h2>
              O SEU REPERTÓRIO MERECE
              <br />
              <em>ESTAR TODO AQUI.</em>
            </h2>
            <ul>
              {[
                'Partituras e áudios reunidos no mesmo espaço',
                'Cordas e sopros: seis instrumentos no projeto',
                'Curadoria planejada para diferentes ocasiões',
                'Uma rotina com mais ensaio e menos procura',
              ].map((item) => (
                <li key={item}>
                  <Check size={18} />
                  {item}
                </li>
              ))}
            </ul>
            <span className="collection-note">
              Essa é a coleção que estamos preparando para você.
            </span>
          </div>
        </Reveal>
        <SectionHeading
          center
          light
          eyebrow="CONHEÇA A PROPOSTA DOS MATERIAIS"
          title={
            <>
              MAIS RECURSOS PARA
              <br />
              <em>A SUA PRÓXIMA APRESENTAÇÃO.</em>
            </>
          }
        />
        <div className="materials-grid">
          {materials.map((material, index) => (
            <Reveal key={material.label} delay={index * 0.07}>
              <article className="material-card">
                <span className="material-strip">
                  0{index + 1} / {material.label}
                </span>
                <div className={`material-cover ${material.className}`} aria-hidden="true">
                  <AudioLines size={26} />
                  <span>MUSIC LIBRARY</span>
                  <strong>{material.cover}</strong>
                  <material.icon size={52} strokeWidth={1.1} />
                  <small>COLEÇÃO EM PREPARAÇÃO</small>
                </div>
                <h3>{material.title}</h3>
                <p>{material.description}</p>
                <span className="material-status">
                  <i />
                  RECURSO PLANEJADO
                </span>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="collection-action">
          <Button href="#planos">Conhecer as modalidades</Button>
        </div>
      </Container>
    </section>
  )
}
