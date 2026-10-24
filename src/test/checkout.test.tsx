import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { CheckoutDialog } from '../components/CheckoutDialog'
import { CheckoutReturn } from '../components/CheckoutReturn'
import { catalog } from '../../shared/products'

const products = catalog.map((p) => ({
  ...p,
  available: true,
  accessType: p.instrument ? 'INSTRUMENT' : 'COMPLETE',
}))
const response = (body: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  )
beforeEach(() => {
  sessionStorage.clear()
  window.history.replaceState({}, '', '/')
})
afterEach(() => {
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

it('exige instrumento no Básico e usa o preço consultado no servidor', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      response({
        checkoutEnabled: true,
        products: products.map((p) => ({ ...p, priceCents: 1990 })),
      }),
    ),
  )
  render(<CheckoutDialog plan="basic" instrument={null} onClose={() => {}} />)
  const button = await screen.findByRole('button', { name: 'Continuar para o pagamento' })
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
  expect(button).toBeDisabled()
  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Qual é o seu instrumento?' }),
    'violin',
  )
  expect(screen.getByText('Biblioteca de Violino')).toBeInTheDocument()
  expect(screen.getByText('R$ 19,90')).toBeInTheDocument()
  expect(button).toBeEnabled()
})

it('bloqueia o envio quando as vendas estão fechadas', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => response({ checkoutEnabled: false, products })),
  )
  render(<CheckoutDialog plan="complete" instrument={null} onClose={() => {}} />)
  expect(await screen.findByText(/As compras ainda não estão disponíveis/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Continuar para o pagamento' })).toBeDisabled()
})

it('envia somente productId, impede cliques repetidos e apresenta falha recuperável', async () => {
  let fail: (value: Response) => void = () => {}
  const fetchMock = vi
    .fn()
    .mockImplementationOnce(() => response({ checkoutEnabled: true, products }))
    .mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          fail = resolve
        }),
    )
  vi.stubGlobal('fetch', fetchMock)
  render(<CheckoutDialog plan="complete" instrument={null} onClose={() => {}} />)
  const user = userEvent.setup()
  const button = await screen.findByRole('button', { name: 'Continuar para o pagamento' })
  await waitFor(() => expect(button).toBeEnabled())
  await user.dblClick(button)
  expect(fetchMock).toHaveBeenCalledTimes(2)
  const init = fetchMock.mock.calls[1][1]
  expect(JSON.parse(init.body)).toEqual({ productId: 'library-complete' })
  expect(init.headers['Idempotency-Key']).toMatch(/^[a-f\d-]{36}$/)
  expect(init.headers['X-Checkout-Token']).toHaveLength(64)
  expect(screen.getByRole('button', { name: /Abrindo Mercado Pago/ })).toBeDisabled()
  fail(
    new Response(
      JSON.stringify({ code: 'SERVICE_UNAVAILABLE', message: 'Mercado Pago indisponível.' }),
      { status: 503 },
    ),
  )
  expect(await screen.findByRole('alert')).toHaveTextContent('Mercado Pago indisponível.')
  expect(screen.getByRole('button', { name: 'Continuar para o pagamento' })).toBeEnabled()
})

it('não aprova pela URL de sucesso e aguarda confirmação do servidor', async () => {
  const id = crypto.randomUUID()
  sessionStorage.setItem(`ml:order:${id}`, 'a'.repeat(64))
  window.history.replaceState({}, '', `/checkout/success?order=${id}&status=approved`)
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      response({
        orderId: id,
        productName: 'Biblioteca de Violino',
        status: 'PENDING',
        accessReady: false,
        emailSent: false,
      }),
    ),
  )
  render(<CheckoutReturn />)
  expect(await screen.findByRole('heading', { name: 'Aguardando confirmação' })).toBeInTheDocument()
  expect(screen.queryByText('Pagamento confirmado.')).not.toBeInTheDocument()
})

it('informa processamento do acesso quando pagamento já está confirmado', async () => {
  const id = crypto.randomUUID()
  sessionStorage.setItem(`ml:order:${id}`, 'a'.repeat(64))
  window.history.replaceState({}, '', `/checkout/success?order=${id}`)
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      response({
        orderId: id,
        productName: 'Acesso Completo',
        status: 'APPROVED',
        accessReady: false,
        emailSent: false,
      }),
    ),
  )
  render(<CheckoutReturn />)
  expect(await screen.findByRole('heading', { name: 'Pagamento confirmado.' })).toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('Estamos preparando seu acesso')
})

it('não consulta pedidos de outro navegador sem token', async () => {
  window.history.replaceState(
    {},
    '',
    `/checkout/success?order=${crypto.randomUUID()}&status=approved`,
  )
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  render(<CheckoutReturn />)
  expect(screen.getByRole('status')).toHaveTextContent('Não foi possível identificar o pedido')
  expect(fetchMock).not.toHaveBeenCalled()
})

it('abre uma revisão de pagamento privativa e preserva o token para o retorno do Mercado Pago', async () => {
  const id = crypto.randomUUID(),
    token = 'a'.repeat(64)
  window.history.replaceState({}, '', `/checkout/pending?order=${id}&iniciar=1#token=${token}`)
  const checkoutUrl = 'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=ORD123'
  const fetchMock = vi.fn(() =>
    response({
      orderId: id,
      productName: 'Biblioteca de Violino',
      priceCents: 100,
      checkoutUrl,
      status: 'PENDING',
      accessReady: false,
      emailSent: false,
    }),
  )
  vi.stubGlobal('fetch', fetchMock)
  render(<CheckoutReturn />)
  expect(await screen.findByRole('heading', { name: 'Confira seu pagamento.' })).toBeInTheDocument()
  expect(screen.getByText('R$ 1,00')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Continuar para o Mercado Pago' })).toHaveAttribute(
    'href',
    checkoutUrl,
  )
  expect(sessionStorage.getItem(`ml:order:${id}`)).toBe(token)
  expect(window.location.hash).toBe('')
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining(`/orders/${id}`),
    expect.objectContaining({ headers: { 'X-Checkout-Token': token } }),
  )
})

it('não mostra botão de pagamento para host inválido ou pedido finalizado', async () => {
  const id = crypto.randomUUID()
  sessionStorage.setItem(`ml:order:${id}`, 'a'.repeat(64))
  window.history.replaceState({}, '', `/checkout/pending?order=${id}&iniciar=1`)
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      response({
        orderId: id,
        productName: 'Biblioteca de Violino',
        priceCents: 100,
        checkoutUrl: 'https://untrusted.example/pay',
        status: 'PENDING',
        accessReady: false,
        emailSent: false,
      }),
    ),
  )
  render(<CheckoutReturn />)
  await screen.findByRole('heading', { name: 'Aguardando confirmação' })
  expect(
    screen.queryByRole('link', { name: 'Continuar para o Mercado Pago' }),
  ).not.toBeInTheDocument()
})
