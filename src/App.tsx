import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from 'react'
import { MotionConfig } from 'motion/react'
import { HeroSection } from './components/HeroSection'
import { AudioComparison } from './components/AudioComparison'
import { MaterialsSection } from './components/MaterialsSection'
import { PricingSection } from './components/PricingSection'
import { OfferContents } from './components/OfferContents'
import { FAQSection, Footer } from './components/ClosingSections'
import { InfoDialog } from './components/InfoDialog'
import { ScrollProgress } from './components/ScrollProgress'
import { CheckoutDialog } from './components/CheckoutDialog'
import { FreeLibraryDialog } from './components/FreeLibraryDialog'
import { SalesHeader } from './components/SalesHeader'
import { ConfidenceSection } from './components/ConversionSections'
import { VisitPlaylist } from './components/VisitPlaylist'
import { ContactBubble } from './components/ContactBubble'
import { productCatalog } from './lib/product-catalog'
import { OfferRenderTime } from './lib/use-offer-pricing'
import { localPathname } from './lib/site-language'
import {
  StoriesSection,
  PreparationSection,
  FinalInvitation,
} from './components/ViolinSalesSections'
import './styles/violin.css'
import './styles/typography.css'
import './styles/sales-header.css'
import './styles/hero.css'

const CheckoutReturn = lazy(() =>
  import('./components/CheckoutReturn').then((m) => ({ default: m.CheckoutReturn })),
)
const MemberLibrary = lazy(() =>
  import('./components/MemberLibrary').then((m) => ({ default: m.MemberLibrary })),
)

const subscribeToClient = () => () => {}

export default function App({ renderedAt }: { renderedAt?: number } = {}) {
  const pathname = typeof window === 'undefined' ? '/' : localPathname(window.location.pathname)
  // The visit playlist chooses its opening track and settings in the browser.
  const clientReady = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  )
  const [info, setInfo] = useState<{ title: string; text: string } | null>(null)
  const [checkout, setCheckout] = useState<string | null>(null)
  const [freeOpen, setFreeOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  useEffect(() => {
    if (pathname === '/biblioteca' || pathname.startsWith('/checkout/')) return
    productCatalog.prefetch()
  }, [pathname])
  const showInfo = (title: string, text: string) => setInfo({ title, text })
  if (/^\/checkout\/(success|pending|failure)\/?$/.test(pathname))
    return (
      <Suspense fallback={<p role="status">Carregando seu pedido…</p>}>
        <CheckoutReturn />
      </Suspense>
    )
  if (pathname === '/biblioteca')
    return (
      <Suspense fallback={<p role="status">Carregando sua biblioteca…</p>}>
        <MemberLibrary />
      </Suspense>
    )
  return (
    <OfferRenderTime.Provider value={renderedAt}>
      <MotionConfig reducedMotion="user">
        <ScrollProgress />
        <SalesHeader onFree={() => setFreeOpen(true)} onCheckout={setCheckout} />
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <main id="conteudo" className="violin-sales">
          <HeroSection onFree={() => setFreeOpen(true)} />
          <StoriesSection />
          <MaterialsSection />
          <PreparationSection />
          <AudioComparison />
          <ConfidenceSection />
          <OfferContents />
          <PricingSection onCheckout={setCheckout} onFree={() => setFreeOpen(true)} />
          <FAQSection />
          <FinalInvitation />
        </main>
        <Footer onInfo={showInfo} onContact={() => setContactOpen(true)} renderedAt={renderedAt} />
        {clientReady && <VisitPlaylist />}
        <ContactBubble open={contactOpen} onOpenChange={setContactOpen} />
        <InfoDialog info={info} onClose={() => setInfo(null)} />
        <CheckoutDialog plan={checkout} onClose={() => setCheckout(null)} />
        <FreeLibraryDialog open={freeOpen} onClose={() => setFreeOpen(false)} />
      </MotionConfig>
    </OfferRenderTime.Provider>
  )
}
