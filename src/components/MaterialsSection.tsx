import { useState } from 'react'
import { ChevronDown, FileMusic, FolderOpen, Headphones } from 'lucide-react'
import type { InstrumentId } from '../types'
import { LibraryPreview } from './LibraryPreview'
import { Container, Reveal, SectionHeading } from './ui'

const materials = [
  { icon: FileMusic, title: 'Partituras', text: 'Separadas por instrumento e música.' },
  { icon: Headphones, title: 'Backing tracks', text: 'Acompanhamentos junto dos materiais.' },
  { icon: FolderOpen, title: 'Tudo em pastas', text: 'Abra, encontre a música e toque.' },
]

export function MaterialsSection({
  instrument,
  onInstrumentChange,
}: {
  instrument: InstrumentId | null
  onInstrumentChange: (id: InstrumentId | null) => void
}) {
  const [showPreview, setShowPreview] = useState(false)
  return (
    <section id="material" className="delivery-section section-space">
      <Container>
        <SectionHeading
          eyebrow="DIRETO AO QUE IMPORTA"
          center
          title={
            <>
              O QUE VOCÊ
              <br />
              <em>RECEBE.</em>
            </>
          }
        />
        <div className="delivery-materials">
          {materials.map((material, index) => (
            <Reveal key={material.title} delay={index * 0.07}>
              <article>
                <material.icon size={25} />
                <h3>{material.title}</h3>
                <p>{material.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="delivery-access" id="como-funciona">
          <h3>Entrega digital, sem complicação.</h3>
          <ol>
            <li>
              <span>01</span>Escolha o plano
            </li>
            <li>
              <span>02</span>Confirme a compra
            </li>
            <li>
              <span>03</span>Receba o acesso por e-mail
            </li>
          </ol>
          <small>Fluxo previsto para o lançamento.</small>
        </div>
        <details
          className="delivery-preview"
          id="biblioteca"
          onToggle={(event) => event.currentTarget.open && setShowPreview(true)}
        >
          <summary>
            <FolderOpen size={19} />
            <span>Ver como os materiais ficam organizados</span>
            <ChevronDown size={18} />
          </summary>
          {showPreview && (
            <LibraryPreview
              instrument={instrument}
              onInstrumentChange={onInstrumentChange}
              embedded
            />
          )}
        </details>
      </Container>
    </section>
  )
}
