import { ArrowRight, ArrowUpRight, Music2 } from 'lucide-react'
import { instruments } from '../data/content'
import type { InstrumentId } from '../types'
import { Container, InstrumentImage, Reveal, SectionHeading } from './ui'

export function InstrumentSelector({
  selected,
  onSelect,
}: {
  selected: InstrumentId
  onSelect: (id: InstrumentId) => void
}) {
  const current = instruments.find((instrument) => instrument.id === selected)!
  return (
    <section id="instrumentos" className="instrument-section section-space">
      <Container>
        <div className="section-topline">
          <SectionHeading
            eyebrow="CADA INSTRUMENTO, UM UNIVERSO"
            title={
              <>
                Encontre o seu som.
                <br />
                <em>Amplie suas possibilidades.</em>
              </>
            }
          >
            Uma biblioteca pensada para acompanhar o seu instrumento, o seu ritmo e a sua próxima
            apresentação.
          </SectionHeading>
          <span className="section-aside">
            DAS CORDAS AOS SOPROS.
            <br />
            DA PRIMEIRA NOTA AO PALCO.
          </span>
        </div>
        <div className="instrument-grid">
          {instruments.map((instrument, index) => (
            <Reveal key={instrument.id} delay={(index % 3) * 0.08}>
              <article
                className={`instrument-card ${selected === instrument.id ? 'instrument-card-selected' : ''}`}
              >
                <InstrumentImage
                  index={instrument.imageIndex}
                  name={`Imagem ilustrativa de ${instrument.name}`}
                />
                <div className="instrument-card-content">
                  <span className="instrument-index">0{instrument.imageIndex + 1}</span>
                  <h3>{instrument.name}</h3>
                  <p>{instrument.description}</p>
                  <button
                    type="button"
                    aria-pressed={selected === instrument.id}
                    onClick={() => onSelect(instrument.id)}
                  >
                    Explorar repertório <ArrowUpRight size={16} />
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="instrument-detail" aria-live="polite">
          <span className="instrument-detail-icon">
            <Music2 size={23} />
          </span>
          <div>
            <span className="micro-label">SELEÇÃO DE EXEMPLO · {current.tuning}</span>
            <h3>{current.name}</h3>
            <p>{current.detail}</p>
          </div>
          <a href="#biblioteca">
            Ver estudos demonstrativos <ArrowRight size={17} />
          </a>
        </div>
      </Container>
    </section>
  )
}
