import { useState } from 'react'
import { MotionConfig } from 'motion/react'
import type { InstrumentId } from './types'
import { HeroSection } from './components/HeroSection'
import { AudioComparison } from './components/AudioComparison'
import { MaterialsSection } from './components/MaterialsSection'
import { PricingSection } from './components/PricingSection'
import { FAQSection, Footer } from './components/ClosingSections'
import { InfoDialog } from './components/InfoDialog'
import { ScrollProgress } from './components/ScrollProgress'

export default function App() {
  const [instrument, setInstrument] = useState<InstrumentId | null>(null)
  const [info, setInfo] = useState<{ title: string; text: string } | null>(null)
  const showInfo = (title: string, text: string) => setInfo({ title, text })
  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <main id="conteudo">
        <HeroSection />
        <AudioComparison />
        <MaterialsSection instrument={instrument} onInstrumentChange={setInstrument} />
        <PricingSection onInfo={showInfo} />
        <FAQSection />
      </main>
      <Footer onInfo={showInfo} />
      <InfoDialog info={info} onClose={() => setInfo(null)} />
    </MotionConfig>
  )
}
