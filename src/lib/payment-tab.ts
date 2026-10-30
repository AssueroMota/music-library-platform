import { trustedCheckoutUrl } from './api'

export interface PaymentDestination {
  checkoutUrl: string
  orderId?: string
  token?: string
}

// Reserve the tab during the click, before awaiting the checkout API.
export function reservePaymentTab(): Window | null {
  let tab: Window | null = null
  try {
    tab = window.open('about:blank', '_blank')
    if (tab) {
      tab.opener = null
      tab.document.title = 'Abrindo pagamento | Music Library'
      tab.document.body.textContent = 'Estamos preparando seu pagamento. Aguarde um instante…'
      const referrer = tab.document.createElement('meta')
      referrer.name = 'referrer'
      referrer.content = 'no-referrer'
      tab.document.head.append(referrer)
    }
    return tab
  } catch {
    tab?.close()
    return null
  }
}

export function continuePaymentInTab(tab: Window | null, payment: PaymentDestination): boolean {
  const url = trustedCheckoutUrl(payment.checkoutUrl)
  if (payment.orderId && payment.token)
    sessionStorage.setItem(`ml:order:${payment.orderId}`, payment.token)
  if (!tab || tab.closed) return false
  try {
    // sessionStorage is separate in each tab. Seed the return token before leaving
    // this origin so the payment tab can identify the order when Mercado Pago returns.
    if (payment.orderId && payment.token)
      tab.sessionStorage.setItem(`ml:order:${payment.orderId}`, payment.token)
    tab.location.replace(url)
    return true
  } catch {
    tab.close()
    return false
  }
}

export function paymentFallbackUrl(payment: PaymentDestination): string {
  const checkoutUrl = trustedCheckoutUrl(payment.checkoutUrl)
  if (!payment.orderId || !payment.token) return checkoutUrl
  // Native links with noopener do not inherit sessionStorage. The existing private
  // review page accepts the token in the fragment, never in the server query string.
  const url = new URL('/checkout/pending', window.location.origin)
  url.searchParams.set('order', payment.orderId)
  url.searchParams.set('iniciar', '1')
  url.hash = new URLSearchParams({ token: payment.token }).toString()
  return url.href
}
