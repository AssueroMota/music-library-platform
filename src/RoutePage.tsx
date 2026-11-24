import { lazy, Suspense } from 'react'
import { LibraryLoadingPage } from './components/LibraryLoading'
import { LanguageSwitch } from './components/LanguageSwitch'
import { englishSite, localPathname } from './lib/site-language'

// Keep sales animations and media code out of the member entry bundle.
const pathname = localPathname(window.location.pathname)
const scoreCheckout = pathname === '/checkout/partitura'
const routeLanguage = new URL(window.location.href)
if (englishSite && pathname.startsWith('/checkout/'))
  routeLanguage.searchParams.set('lang', 'pt-BR')
const Page = lazy(() =>
  pathname === '/biblioteca'
    ? import('./components/MemberLibrary').then((module) => ({ default: module.MemberLibrary }))
    : scoreCheckout
      ? import('./components/CatalogCheckout').then((module) => ({ default: module.CatalogCheckout }))
      : /^\/checkout\/(success|pending|failure)\/?$/.test(pathname)
        ? import('./components/CheckoutReturn').then((module) => ({ default: module.CheckoutReturn }))
        : import('./App'),
)

export function RoutePage() {
  return (
    <>
      {!scoreCheckout && (
        <div className="route-language">
          <LanguageSwitch path={pathname} suffix={routeLanguage.search + routeLanguage.hash} />
        </div>
      )}
      <Suspense
        fallback={
          pathname === '/biblioteca' ? <LibraryLoadingPage /> : <p role="status">Carregando…</p>
        }
      >
        <Page />
      </Suspense>
    </>
  )
}
