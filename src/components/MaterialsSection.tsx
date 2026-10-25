import { useState } from 'react'
import { ChevronDown, FileMusic, FolderOpen, Headphones } from 'lucide-react'
import type { InstrumentId } from '../types'
import { LibraryPreview } from './LibraryPreview'
import { Container, Reveal, SectionHeading } from './ui'
import { violinDemonstration as demo } from '../data/demonstration'

const materials = [
  {
    icon: FileMusic,
    title: 'Partituras para o seu violino',
    text: 'Encontre a música, abra o material e trabalhe os detalhes da sua interpretação.',
  },
  {
    icon: Headphones,
    title: 'Dê o play no seu ensaio',
    text: 'No Plano Completo, acompanhe a partitura com playback e pratique tocando junto da base.',
  },
  {
    icon: FolderOpen,
    title: 'Sua biblioteca, organizada',
    text: 'Acesse pelo computador, tablet ou celular. Seus materiais digitais reunidos por música.',
  },
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
          eyebrow="O MATERIAL QUE ACOMPANHA A SUA PREPARAÇÃO"
          center
          title={
            <>
              Partitura na estante.
              <br />
              <em>Foco na sua música.</em>
            </>
          }
        />
        <div className="materials-overview">
          <Reveal className="material-showcase">
            <div className="material-book">
              <FileMusic size={28} />
              <span>MUSIC LIBRARY</span>
              <strong>VIOLINO</strong>
              <small>
                PARTITURAS
                <br />+ PLAYBACKS
              </small>
              <span className="book-edition">SUA MÚSICA COMEÇA AQUI</span>
            </div>
            <div className="material-sheet">
              <img
                src={demo.score}
                width={demo.scoreWidth}
                height={demo.scoreHeight}
                alt="Exemplo de partitura para violino: A Thousand Years"
                loading="lazy"
              />
            </div>
            <div className="material-playback">
              <Headphones size={22} />
              <span>
                PARTITURA + ACOMPANHAMENTO<strong>Disponível no Plano Completo</strong>
              </span>
              <span className="playback-mini-wave" aria-hidden="true">
                ▂▅▃▇▅▃▆▂
              </span>
            </div>
            <p className="showcase-caption">Apresentação ilustrativa do material digital.</p>
          </Reveal>
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
          <small>
            Seu acesso é preparado após a confirmação do pagamento. O acervo está em preparação.
          </small>
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
