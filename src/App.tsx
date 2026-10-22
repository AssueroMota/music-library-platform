import { useState } from 'react'
import { MotionConfig } from 'motion/react'
import type { InstrumentId } from './types'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { InstrumentSelector } from './components/InstrumentSelector'
import { AudioComparison } from './components/AudioComparison'
import { BenefitsSection } from './components/BenefitsSection'
import { LibraryPreview } from './components/LibraryPreview'
import { RepertoireCategories } from './components/RepertoireCategories'
import { ComparisonSection, HowItWorks } from './components/JourneySections'
import { PricingSection } from './components/PricingSection'
import { AboutSection, FAQSection, FinalCTA, Footer } from './components/ClosingSections'
import { InfoDialog } from './components/InfoDialog'

export default function App() {
  const [instrument, setInstrument] = useState<InstrumentId>('violin')
  const [info, setInfo] = useState<{ title: string; text: string } | null>(null)
  const showInfo = (title: string, text: string) => setInfo({ title, text })
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <HeroSection />
        <InstrumentSelector selected={instrument} onSelect={setInstrument} />
        <AudioComparison />
        <BenefitsSection />
        <LibraryPreview instrument={instrument} onInstrumentChange={setInstrument} />
        <RepertoireCategories />
        <HowItWorks />
        <ComparisonSection />
        <PricingSection onInfo={showInfo} />
        <AboutSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer onInfo={showInfo} />
      <InfoDialog info={info} onClose={() => setInfo(null)} />
    </MotionConfig>
  )
}
