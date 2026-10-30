import { lazy, Suspense, useEffect, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { HeroSection } from './components/HeroSection'
import { AudioComparison } from './components/AudioComparison'
import { MaterialsSection } from './components/MaterialsSection'
import { PricingSection } from './components/PricingSection'
import { FAQSection, Footer } from './components/ClosingSections'
import { InfoDialog } from './components/InfoDialog'
import { ScrollProgress } from './components/ScrollProgress'
import { CheckoutDialog } from './components/CheckoutDialog'
import { LaunchOfferHeader } from './components/LaunchOfferCountdown'
import { ConfidenceSection } from './components/ConversionSections'
import { VisitPlaylist } from './components/VisitPlaylist'
import { ContactBubble } from './components/ContactBubble'
import { productCatalog } from './lib/product-catalog'
import {
  VideoSection,
  StoriesSection,
  PreparationSection,
  FinalInvitation,
} from './components/ViolinSalesSections'
import './styles/violin.css'
import './styles/typography.css'

const CheckoutReturn = lazy(() =>
  import('./components/CheckoutReturn').then((m) => ({ default: m.CheckoutReturn })),
)
const MemberLibrary = lazy(() =>
  import('./components/MemberLibrary').then((m) => ({ default: m.MemberLibrary })),
)

export default function App() {
  const [info, setInfo] = useState<{ title: string; text: string } | null>(null)
  const [checkout, setCheckout] = useState<string | null>(null)
  const [contactOpen, setContactOpen] = useState(false)
  useEffect(() => {
    if (
      window.location.pathname === '/biblioteca' ||
      window.location.pathname.startsWith('/checkout/')
    )
      return
    productCatalog.prefetch()
  }, [])
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
      <LaunchOfferHeader onCheckout={setCheckout} />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <main id="conteudo" className="violin-sales">
        <HeroSection />
        <StoriesSection />
        <VideoSection />
        <PreparationSection />
        <MaterialsSection />
        <AudioComparison />
        <ConfidenceSection />
        <PricingSection onCheckout={setCheckout} />
        <FAQSection />
        <FinalInvitation />
      </main>
      <Footer onInfo={showInfo} onContact={() => setContactOpen(true)} />
      <VisitPlaylist />
      <ContactBubble open={contactOpen} onOpenChange={setContactOpen} />
      <InfoDialog info={info} onClose={() => setInfo(null)} />
      <CheckoutDialog plan={checkout} onClose={() => setCheckout(null)} />
    </MotionConfig>
  )
}
