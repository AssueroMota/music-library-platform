import { lazy, Suspense, useState } from 'react'
import { MotionConfig } from 'motion/react'
import type { InstrumentId } from './types'
import { HeroSection } from './components/HeroSection'
import { AudioComparison } from './components/AudioComparison'
import { MaterialsSection } from './components/MaterialsSection'
import { PricingSection } from './components/PricingSection'
import { FAQSection, Footer } from './components/ClosingSections'
import { InfoDialog } from './components/InfoDialog'
import { ScrollProgress } from './components/ScrollProgress'
import { CheckoutDialog } from './components/CheckoutDialog'

const CheckoutReturn = lazy(() =>
  import('./components/CheckoutReturn').then((m) => ({ default: m.CheckoutReturn })),
)
const MemberLibrary = lazy(() =>
  import('./components/MemberLibrary').then((m) => ({ default: m.MemberLibrary })),
)

export default function App() {
  const [instrument, setInstrument] = useState<InstrumentId | null>(null)
  const [info, setInfo] = useState<{ title: string; text: string } | null>(null)
  const [checkout, setCheckout] = useState<string | null>(null)
  const showInfo = (title: string, text: string) => setInfo({ title, text })
  if (/^\/checkout\/(success|pending|failure)\/?$/.test(window.location.pathname))
    return (
      <Suspense fallback={<p role="status">Carregando seu pedido…</p>}>
        <CheckoutReturn />
      </Suspense>
    )
  if (window.location.pathname === '/biblioteca')
    return (
      <Suspense fallback={<p role="status">Carregando sua biblioteca…</p>}>
        <MemberLibrary />
      </Suspense>
    )
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
        <PricingSection onCheckout={setCheckout} />
        <FAQSection />
      </main>
      <Footer onInfo={showInfo} />
      <InfoDialog info={info} onClose={() => setInfo(null)} />
      <CheckoutDialog plan={checkout} instrument={instrument} onClose={() => setCheckout(null)} />
    </MotionConfig>
  )
}
