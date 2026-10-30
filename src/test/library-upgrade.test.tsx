import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LibraryUpgrade } from '../components/LibraryUpgrade'
import { fakePaymentTab } from './payment-tab-fixture'

const quote = {
  alreadyComplete: false,
  email: 'buyer@gmail.com',
  completePriceCents: 4990,
  creditCents: 1290,
  priceCents: 3700,
  pendingCheckoutUrl: null,
  available: true,
  checkoutEnabled: true,
}
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
beforeEach(() => {
  sessionStorage.clear()
  vi.spyOn(window, 'open').mockReturnValue(null)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
function mount(alreadyComplete = false) {
  const onRefresh = vi.fn(),
    onClose = vi.fn()
  render(
    <LibraryUpgrade
      token="session-test"
      userId="user-test"
      alreadyComplete={alreadyComplete}
      onRefresh={onRefresh}
      onClose={onClose}
    />,
  )
  return { onRefresh, onClose }
}

it('mostra o desconto e exige clique antes de criar pagamento, usando a identidade autenticada', async () => {
  const { tab, handle } = fakePaymentTab()
  vi.mocked(window.open).mockReturnValue(handle)
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(response(quote))
    .mockResolvedValueOnce(response({ code: 'TEMPORARY', message: 'Teste sem cobrança real' }, 503))
  vi.stubGlobal('fetch', fetchMock)
  mount()
  expect(await screen.findByText('Somente a diferença')).toBeInTheDocument()
  expect(screen.getByText('R$ 49,90')).toBeInTheDocument()
  expect(screen.getByText('− R$ 12,90')).toBeInTheDocument()
  expect(screen.getByText('R$ 37,00')).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledTimes(1)
  await userEvent.click(screen.getByRole('button', { name: /Fazer upgrade por/ }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Teste sem cobrança real')
  expect(tab.close).toHaveBeenCalledOnce()
  const [url, init] = fetchMock.mock.calls[1]
  expect(url).toMatch(/\/api\/library\/upgrade$/)
  expect(init.headers.Authorization).toBe('Bearer session-test')
  expect(JSON.parse(init.body)).toEqual({ expectedPriceCents: 3700 })
  expect(sessionStorage.getItem('ml:upgrade-pending:user-test')).toBe('1')
})

it('abre o upgrade em outra aba com o token de retorno e mantém a biblioteca aberta', async () => {
  const { tab, handle, storage } = fakePaymentTab()
  vi.mocked(window.open).mockReturnValue(handle)
  const orderId = crypto.randomUUID()
  const checkoutUrl = 'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=upgrade'
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(response(quote))
    .mockResolvedValueOnce(response({ orderId, checkoutUrl }))
  vi.stubGlobal('fetch', fetchMock)
  mount()
  await userEvent.click(await screen.findByRole('button', { name: /Fazer upgrade por/ }))
  expect(
    await screen.findByRole('link', { name: 'Abrir pagamento em outra aba' }),
  ).toBeInTheDocument()
  expect(tab.location.replace).toHaveBeenCalledWith(checkoutUrl)
  expect(storage.get(`ml:order:${orderId}`)).toBe(
    fetchMock.mock.calls[1][1].headers['X-Checkout-Token'],
  )
  expect(screen.getByRole('button', { name: 'Fechar upgrade' })).toBeEnabled()
})

it('continua upgrade pendente em outra aba sem criar outro pedido', async () => {
  const { tab, handle } = fakePaymentTab()
  vi.mocked(window.open).mockReturnValue(handle)
  const checkoutUrl = 'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=existing'
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(response({ ...quote, pendingCheckoutUrl: checkoutUrl }))
  vi.stubGlobal('fetch', fetchMock)
  mount()
  await userEvent.click(await screen.findByRole('button', { name: 'Continuar pagamento iniciado' }))
  expect(tab.location.replace).toHaveBeenCalledWith(checkoutUrl)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

it('atualiza valor alterado e exige outro clique sem repetir cobrança', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(response(quote))
    .mockResolvedValueOnce(
      response({ code: 'PRODUCT_PRICE_CHANGED', message: 'Confira o novo valor' }, 409),
    )
    .mockResolvedValueOnce(response({ ...quote, priceCents: 4000, completePriceCents: 5290 }))
  vi.stubGlobal('fetch', fetchMock)
  mount()
  await userEvent.click(await screen.findByRole('button', { name: /Fazer upgrade por/ }))
  expect(await screen.findByRole('button', { name: /Fazer upgrade por R\$\s40,00/ })).toBeEnabled()
  expect(fetchMock.mock.calls.filter(([, init]) => init.method === 'POST')).toHaveLength(1)
})

it('titular do Completo volta à própria biblioteca sem cobrança na prévia do Básico', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  const { onRefresh } = mount(true)
  await userEvent.click(screen.getByRole('button', { name: 'Abrir meu Completo' }))
  expect(onRefresh).toHaveBeenCalledTimes(1)
  expect(fetchMock).not.toHaveBeenCalled()
})

it('oferece continuar o pagamento existente e bloqueia compra indisponível', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      response({
        ...quote,
        pendingCheckoutUrl: 'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=existing',
        checkoutEnabled: false,
      }),
    ),
  )
  mount()
  expect(await screen.findByRole('button', { name: 'Continuar pagamento iniciado' })).toBeDisabled()
  expect(screen.queryByRole('button', { name: /Fazer upgrade por/ })).not.toBeInTheDocument()
})

it('recupera falha de consulta e permite conferir um pagamento já realizado', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(response({ message: 'Aguarde um instante' }, 503))
    .mockResolvedValueOnce(response(quote))
  vi.stubGlobal('fetch', fetchMock)
  const { onRefresh } = mount()
  expect(await screen.findByRole('alert')).toHaveTextContent('Aguarde um instante')
  await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /Fazer upgrade por/ })).toBeEnabled(),
  )
  await userEvent.click(screen.getByRole('button', { name: 'Já paguei · Atualizar meu acesso' }))
  expect(onRefresh).toHaveBeenCalledTimes(1)
})
