import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { continuePaymentInTab, paymentFallbackUrl, reservePaymentTab } from '../lib/payment-tab'
import { fakePaymentTab } from './payment-tab-fixture'

const payment = {
  orderId: 'd518e721-0d45-4695-9c31-b840d50273ff',
  token: 'a'.repeat(64),
  checkoutUrl: 'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=test',
}

beforeEach(() => sessionStorage.clear())
afterEach(() => vi.restoreAllMocks())

it('reserva uma aba sem opener e preserva o token nas duas sessões antes de navegar', () => {
  const { tab, handle, storage } = fakePaymentTab()
  const open = vi.spyOn(window, 'open').mockReturnValue(handle)
  expect(reservePaymentTab()).toBe(handle)
  expect(open).toHaveBeenCalledWith('about:blank', '_blank')
  expect(tab.opener).toBeNull()
  expect(tab.document.querySelector('meta[name="referrer"]')?.getAttribute('content')).toBe(
    'no-referrer',
  )
  tab.location.replace.mockImplementation(() => {
    expect(storage.get(`ml:order:${payment.orderId}`)).toBe(payment.token)
    expect(sessionStorage.getItem(`ml:order:${payment.orderId}`)).toBe(payment.token)
  })
  expect(continuePaymentInTab(handle, payment)).toBe(true)
  expect(tab.location.replace).toHaveBeenCalledWith(payment.checkoutUrl)
})

it('oferece revisão em nova aba quando a abertura é bloqueada, com token somente no fragmento', () => {
  vi.spyOn(window, 'open').mockReturnValue(null)
  expect(reservePaymentTab()).toBeNull()
  expect(continuePaymentInTab(null, payment)).toBe(false)
  const fallback = new URL(paymentFallbackUrl(payment))
  expect(fallback.origin).toBe(window.location.origin)
  expect(fallback.pathname).toBe('/checkout/pending')
  expect(fallback.searchParams.get('order')).toBe(payment.orderId)
  expect(fallback.search).not.toContain(payment.token)
  expect(new URLSearchParams(fallback.hash.slice(1)).get('token')).toBe(payment.token)
})

it('mantém a continuação disponível se a aba for fechada antes da resposta', () => {
  const { tab, handle } = fakePaymentTab()
  tab.closed = true
  expect(continuePaymentInTab(handle, payment)).toBe(false)
  expect(tab.location.replace).not.toHaveBeenCalled()
})

it('fecha a aba e permite a revisão se o navegador impedir gravar a sessão de retorno', () => {
  const { tab, handle } = fakePaymentTab()
  tab.sessionStorage.setItem.mockImplementation(() => {
    throw new Error('Storage blocked')
  })
  expect(continuePaymentInTab(handle, payment)).toBe(false)
  expect(tab.close).toHaveBeenCalledOnce()
  expect(tab.location.replace).not.toHaveBeenCalled()
})

it('recusa endereços externos ao checkout oficial antes de navegar', () => {
  const { tab, handle } = fakePaymentTab()
  expect(() =>
    continuePaymentInTab(handle, { ...payment, checkoutUrl: 'https://example.com' }),
  ).toThrow()
  expect(() => paymentFallbackUrl({ ...payment, checkoutUrl: 'https://example.com' })).toThrow()
  expect(tab.location.replace).not.toHaveBeenCalled()
})
