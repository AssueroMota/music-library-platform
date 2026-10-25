import { Headphones, Expand, FileMusic, Play } from 'lucide-react'
import { Container, Reveal, SectionHeading } from './ui'
import { AudioPlayer } from './AudioPlayer'
import { violinDemonstration as demo } from '../data/demonstration'

export function AudioComparison() {
  return (
    <section id="demonstracao" className="audio-section section-space">
      <Container>
        <SectionHeading
          eyebrow="OUÇA ANTES DE ESCOLHER"
          center
          title={
            <>
              Veja a partitura.
              <br />
              <em>Ouça o acompanhamento.</em>
            </>
          }
        >
          A Thousand Years, de Christina Perri. Abra a partitura para violino e dê o play no
          acompanhamento para experimentar seu próximo ensaio.
        </SectionHeading>
        <div className="audio-proof-layout">
          <Reveal className="audio-proof-score">
            <span className="proof-score-label">PARTITURA PARA VIOLINO · A THOUSAND YEARS</span>
            <a
              className="demo-score-image-link"
              href={demo.score}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver a partitura de A Thousand Years ampliada"
            >
              <img
                className="demo-score-image"
                src={demo.score}
                width={demo.scoreWidth}
                height={demo.scoreHeight}
                alt="Partitura de A Thousand Years, Christina Perri, para violino, em Si bemol maior e compasso 12 por 8"
                loading="lazy"
              />
              <span className="demo-score-expand">
                <Expand size={15} /> Ver partitura ampliada
              </span>
            </a>
            <div className="proof-score-facts">
              <span>{demo.key}</span>
              <span>{demo.meter}</span>
              <span aria-label="Semínima pontuada igual a 46">{demo.tempo}</span>
            </div>
            <a className="text-link" href="#biblioteca">
              Explorar a organização da biblioteca <span aria-hidden="true">↗</span>
            </a>
          </Reveal>
          <div className="audio-comparison-grid">
            <Reveal>
              <article className="audio-card">
                <div className="audio-card-top">
                  <span className="audio-card-icon">
                    <Headphones size={22} />
                  </span>
                  <h3>Playback · A Thousand Years</h3>
                </div>
                <AudioPlayer src={demo.backing} label="o playback de A Thousand Years" />
              </article>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="demo-listening-guide">
                <span className="proof-score-label">SEU VIOLINO FAZ A MELODIA</span>
                <h3>
                  Abra a partitura.
                  <br />
                  Toque com a base.
                </h3>
                <ol>
                  <li>
                    <FileMusic size={18} />
                    <span>Amplie a partitura para acompanhar a leitura.</span>
                  </li>
                  <li>
                    <Play size={18} />
                    <span>Dê o play no acompanhamento e entre com seu violino.</span>
                  </li>
                  <li>
                    <Headphones size={18} />
                    <span>Pause e volte ao trecho que quiser praticar.</span>
                  </li>
                </ol>
                <p>Os playbacks fazem parte do Plano Completo.</p>
              </div>
            </Reveal>
          </div>
        </div>
        <p className="audio-disclaimer">
          A Thousand Years · Christina Perri. Demonstração com partitura e playback.
        </p>
      </Container>
    </section>
  )
}
