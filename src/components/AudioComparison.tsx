import { Headphones, Music2 } from 'lucide-react'
import { Container, Reveal, SectionHeading } from './ui'
import { AudioPlayer } from './AudioPlayer'

export function AudioComparison() {
  return (
    <section id="demonstracao" className="audio-section section-space">
      <Container>
        <SectionHeading
          eyebrow="OUÇA ANTES DE ESCOLHER"
          center
          title={
            <>
              OUÇA UMA <em>AMOSTRA.</em>
            </>
          }
        />
        <div className="audio-comparison-grid">
          <Reveal>
            <article className="audio-card">
              <div className="audio-card-top">
                <span className="audio-card-icon">
                  <Headphones size={22} />
                </span>
                <h3>Somente a base</h3>
              </div>
              <AudioPlayer
                src="/audio/primeira-luz-backing.wav"
                label="o acompanhamento de Primeira luz"
              />
            </article>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="audio-card audio-card-gold">
              <div className="audio-card-top">
                <span className="audio-card-icon">
                  <Music2 size={22} />
                </span>
                <h3>Base + melodia</h3>
              </div>
              <AudioPlayer src="/audio/primeira-luz-lead.wav" label="Primeira luz com melodia" />
            </article>
          </Reveal>
        </div>
        <p className="audio-disclaimer">Estudo original com áudio sintetizado de demonstração.</p>
      </Container>
    </section>
  )
}
