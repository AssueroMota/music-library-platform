import { publicEnv } from './public-env'
import { englishSite, languageUrl } from './site-language'

const apiBase = publicEnv(import.meta.env.VITE_API_URL).replace(/\/$/, '')

const englishErrors: Record<string, string> = {
  ACCESS_DENIED: 'This material is not included in your access.',
  ACCESS_LINK_UNAVAILABLE: 'Your access link is unavailable. Request a new copy by email.',
  ALREADY_COMPLETE: 'You already have the Complete plan.',
  CHECKOUT_CONFLICT: 'Start a new checkout attempt.',
  CHECKOUT_UNAVAILABLE: 'Checkout is temporarily unavailable. Try again shortly.',
  DUPLICATE_SONG: 'Each song can appear once in a setlist.',
  INVALID_INPUT: 'Check your details and try again.',
  LOGIN_REQUIRED: 'Sign in again to access your library.',
  NOT_FOUND: 'File not found.',
  ORDER_EXPIRED: 'This payment link has expired. Start a new order.',
  ORDER_FINISHED: 'This order is already closed.',
  ORDER_NOT_FOUND: 'Order not found in this browser.',
  PRODUCT_PRICE_CHANGED: 'The price changed. Review the current price before continuing.',
  PRODUCT_UNAVAILABLE: 'This product is currently unavailable.',
  RATE_LIMITED: 'Too many requests. Please wait and try again.',
  SETLIST_NOT_FOUND: 'Setlist not found.',
  SETLISTS_NOT_INCLUDED: 'The free trial does not include setlists.',
  SONG_UNAVAILABLE: 'One or more songs are unavailable for this setlist.',
  UPGRADE_NOT_AVAILABLE: 'This upgrade is currently unavailable for your account.',
  UPGRADE_PENDING: 'You already have a pending upgrade payment.',
  UPGRADE_PROCESSING: 'Your upgrade is being processed.',
}

// Library requests can be the first request after the API has been idle.
export const LIBRARY_REQUEST_TIMEOUT_MS = 90000

export class ApiError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}
export async function api<T>(path: string, init?: RequestInit, timeoutMs = 15000): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${apiBase}/api${path}`, {
      ...init,
      signal: init?.signal
        ? AbortSignal.any([init.signal, AbortSignal.timeout(timeoutMs)])
        : AbortSignal.timeout(timeoutMs),
    })
  } catch (error) {
    if (init?.signal?.aborted) throw error
    if (error instanceof DOMException && error.name === 'TimeoutError')
      throw new ApiError(
        'O serviço demorou para responder. Aguarde alguns instantes e tente novamente.',
        'REQUEST_TIMEOUT',
      )
    throw new ApiError(
      'Não foi possível conectar ao serviço. Tente novamente em instantes.',
      'NETWORK_ERROR',
    )
  }
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const code = body?.code ?? 'SERVICE_UNAVAILABLE'
    const fallback = 'Serviço indisponível no momento. Tente novamente.'
    throw new ApiError(
      englishSite
        ? Object.hasOwn(englishErrors, code)
          ? englishErrors[code]
          : fallback
        : (body?.message ?? fallback),
      code,
    )
  }
  if (body === null)
    throw new ApiError(
      'O serviço retornou uma resposta inválida. Tente novamente.',
      'INVALID_RESPONSE',
    )
  return body as T
}
export interface PublicProduct {
  id: string
  name: string
  description: string
  priceCents: number
  currency: string
  available: boolean
  instrument: string | null
  accessType: string
}
export interface ProductResponse {
  checkoutEnabled: boolean
  products: PublicProduct[]
}
export interface OrderResponse {
  orderId: string
  productName: string
  priceCents: number
  checkoutUrl: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'REFUNDED' | 'CHARGED_BACK'
  accessReady: boolean
  emailSent: boolean
  personalLink: string | null
}

export function trustedPersonalLibraryUrl(value: string) {
  const url = new URL(value)
  const credentials = new URLSearchParams(url.hash.slice(1))
  if (
    url.origin !== window.location.origin ||
    !['/biblioteca', '/en/biblioteca'].includes(url.pathname) ||
    url.search ||
    url.username ||
    url.password ||
    !/^[a-f0-9-]{36}$/.test(credentials.get('id') ?? '') ||
    !/^[a-f0-9]{64}$/.test(credentials.get('acesso') ?? '')
  )
    throw new Error('Link da biblioteca inválido.')
  url.pathname = languageUrl('/biblioteca', englishSite)
  return url.href
}

export function trustedCheckoutUrl(value: string) {
  const url = new URL(value)
  if (
    url.origin !== 'https://www.mercadopago.com.br' ||
    !url.pathname.startsWith('/checkout/') ||
    url.username ||
    url.password
  )
    throw new Error('Endereço de pagamento inválido. Tente novamente.')
  return url.href
}
export function checkoutAttempt(productId: string) {
  const storageKey = `ml:checkout:${productId}`
  const stored = sessionStorage.getItem(storageKey)
  if (stored) {
    const previous = JSON.parse(stored) as { key: string; token: string; createdAt: number }
    if (Date.now() - previous.createdAt < 23 * 3600000) return previous
  }
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const attempt = {
    key: crypto.randomUUID(),
    token: Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(''),
    createdAt: Date.now(),
  }
  sessionStorage.setItem(storageKey, JSON.stringify(attempt))
  return attempt
}
