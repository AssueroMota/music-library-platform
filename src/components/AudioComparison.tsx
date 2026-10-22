import { Headphones, Music2, Sparkles, AudioLines } from 'lucide-react'
import { Container, Reveal, SectionHeading } from './ui'
import { AudioPlayer } from './AudioPlayer'

export function AudioComparison() {
  return (
    <section id="demonstracao" className="audio-section section-space">
      <Container>
        <div className="audio-section-grid">
          <SectionHeading
            eyebrow="DÊ PLAY NAS POSSIBILIDADES"
            center
            title={
              <>
                DÊ PLAY E OUÇA
                <br />
                <em>AS POSSIBILIDADES.</em>
              </>
            }
          >
            O mesmo estudo, duas perspectivas. Ouça o acompanhamento e descubra como a melodia
            encontra seu lugar.
          </SectionHeading>
          <div className="audio-demo-info">
            <Sparkles size={18} />
            <p>
              <strong>Composição original: Primeira luz</strong>
              <br />
              Dó maior · 80 BPM · áudio sintetizado de demonstração
            </p>
          </div>
        </div>
        <div className="audio-comparison-grid">
          <Reveal>
            <article className="audio-card">
              <div className="audio-card-top">
                <span className="audio-card-icon">
                  <Headphones size={22} />
                </span>
                <span className="micro-label">01 / A BASE DA SUA MÚSICA</span>
              </div>
              <h3>Ouça o acompanhamento</h3>
              <p>O espaço para você assumir a melodia.</p>
              <AudioPlayer
                src="/audio/primeira-luz-backing.wav"
                label="o acompanhamento de Primeira luz"
              />
            </article>
          </Reveal>
          <Reveal>
            <article className="audio-card audio-card-gold">
              <div className="audio-card-top">
                <span className="audio-card-icon">
                  <Music2 size={22} />
                </span>
                <span className="micro-label">02 / TUDO EM HARMONIA</span>
              </div>
              <h3>Ouça com o instrumento principal</h3>
              <p>A mesma base, agora com a melodia de referência.</p>
              <AudioPlayer src="/audio/primeira-luz-lead.wav" label="Primeira luz com melodia" />
            </article>
          </Reveal>
        </div>
        <p className="audio-disclaimer">
          Exemplos autorais com timbres sintetizados. Não representam gravações reais dos
          instrumentos nem a qualidade final do catálogo.
        </p>
        <div className="audio-facts">
          <Reveal>
            <div className="audio-fact fact-gold">
              <Music2 size={22} />
              <div>
                <span>CORDAS E SOPROS NO PROJETO</span>
                <strong>6 instrumentos</strong>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="audio-fact fact-navy">
              <AudioLines size={22} />
              <div>
                <span>PARA VOCÊ EXPERIMENTAR AGORA</span>
                <strong>2 estudos originais</strong>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
