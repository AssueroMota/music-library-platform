import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { PageErrorBoundary } from './components/PageErrorBoundary'
import { RoutePage } from './RoutePage'
import { englishSite, languageUrl } from './lib/site-language'

const url = new URL(window.location.href)
const order = url.searchParams.get('order')
let preferEnglish = false
try {
  preferEnglish = Boolean(
    !englishSite &&
    url.pathname.startsWith('/checkout/') &&
    order &&
    sessionStorage.getItem(`ml:order-language:${order}`) === 'en' &&
    url.searchParams.get('lang') !== 'pt-BR',
  )
} catch {
  // Checkout still works when browser storage is unavailable.
}
if (preferEnglish) {
  url.pathname = languageUrl(url.pathname, true)
  window.location.replace(url)
} else
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <PageErrorBoundary>
        <RoutePage />
      </PageErrorBoundary>
    </StrictMode>,
  )
