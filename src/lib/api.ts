import { publicEnv } from './public-env'

const apiBase = publicEnv(import.meta.env.VITE_API_URL).replace(/\/$/, '')

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
    throw new ApiError(
      'Não foi possível conectar ao serviço. Tente novamente em instantes.',
      'NETWORK_ERROR',
    )
  }
  const body = await response.json().catch(() => null)
  if (!response.ok)
    throw new ApiError(
      body?.message ?? 'Serviço indisponível no momento. Tente novamente.',
      body?.code ?? 'SERVICE_UNAVAILABLE',
    )
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'REFUNDED' | 'CHARGED_BACK'
  accessReady: boolean
  emailSent: boolean
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
