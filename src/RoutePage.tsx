import { lazy, Suspense } from 'react'

// Keep sales animations and media code out of the member entry bundle.
const pathname = window.location.pathname
const Page = lazy(() =>
  pathname === '/biblioteca'
    ? import('./components/MemberLibrary').then((module) => ({ default: module.MemberLibrary }))
    : /^\/checkout\/(success|pending|failure)\/?$/.test(pathname)
      ? import('./components/CheckoutReturn').then((module) => ({ default: module.CheckoutReturn }))
      : import('./App'),
)

export function RoutePage() {
  return (
    <Suspense fallback={<p role="status">Carregando…</p>}>
      <Page />
    </Suspense>
  )
}
