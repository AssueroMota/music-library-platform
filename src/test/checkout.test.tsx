import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { CheckoutDialog } from '../components/CheckoutDialog'
import { CheckoutReturn } from '../components/CheckoutReturn'
import { violinOffers } from '../../shared/products'
import { productCatalog } from '../lib/product-catalog'

const products = violinOffers.map((p) => ({
  ...p,
  available: true,
}))
const response = (body: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  )
beforeEach(() => {
  productCatalog.invalidate()
  sessionStorage.clear()
  window.history.replaceState({}, '', '/')
})
afterEach(() => {
  productCatalog.invalidate()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

function delayedCatalog() {
  vi.useFakeTimers()
  vi.spyOn(AbortSignal, 'timeout').mockImplementation((milliseconds) => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(new DOMException('Timed out', 'TimeoutError')), milliseconds)
    return controller.signal
  })
  let finish: (response: Response) => void = () => {}
  let signal: AbortSignal | undefined
  const fetchMock = vi.fn(
    (_url: string, init: RequestInit) =>
      new Promise<Response>((resolve, reject) => {
        finish = resolve
        signal = init.signal ?? undefined
        signal?.addEventListener('abort', () => reject(signal?.reason), { once: true })
      }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return {
    fetchMock,
    finish: (body: unknown) => finish(new Response(JSON.stringify(body))),
    aborted: () => signal?.aborted,
  }
}

it('aguarda a API iniciar além de 15 segundos, avisa e apresenta o preço real sem criar cobrança', async () => {
  const catalog = delayedCatalog()
  render(<CheckoutDialog plan="complete" onClose={() => {}} />)
  await act(async () => {
    vi.advanceTimersByTime(16000)
  })
  expect(catalog.aborted()).toBe(false)
  expect(screen.getByRole('status')).toHaveTextContent('Estamos confirmando o preço')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  await act(async () => {
    catalog.finish({ checkoutEnabled: true, products })
  })
  expect(screen.getByText('R$ 27,90')).toBeInTheDocument()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(catalog.fetchMock).toHaveBeenCalledTimes(1)
})

it('limita a consulta a um minuto e permite tentar novamente sem reenviar pagamentos', async () => {
  const catalog = delayedCatalog()
  render(<CheckoutDialog plan="basic" onClose={() => {}} />)
  await act(async () => {
    vi.advanceTimersByTime(60000)
  })
  expect(screen.getByRole('alert')).toHaveTextContent('O serviço demorou para responder')
  expect(catalog.fetchMock).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  expect(catalog.fetchMock).toHaveBeenCalledTimes(2)
  await act(async () => {
    catalog.finish({ checkoutEnabled: true, products })
  })
  expect(screen.getByText('R$ 12,90')).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('remove o aviso ao fechar e reaproveita a consulta em andamento ao reabrir', async () => {
  const catalog = delayedCatalog()
  const { rerender } = render(<CheckoutDialog plan="basic" onClose={() => {}} />)
  rerender(<CheckoutDialog plan={null} onClose={() => {}} />)
  await act(async () => {
    vi.advanceTimersByTime(6000)
  })
  expect(catalog.aborted()).toBe(false)
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  rerender(<CheckoutDialog plan="complete" onClose={() => {}} />)
  await act(async () => {
    catalog.finish({ checkoutEnabled: true, products })
  })
  expect(screen.getByText('R$ 27,90')).toBeInTheDocument()
  expect(catalog.fetchMock).toHaveBeenCalledTimes(1)
})

it('abre com o catálogo antecipado e troca de plano sem outra consulta', async () => {
  const fetchMock = vi.fn(() => response({ checkoutEnabled: true, products }))
  vi.stubGlobal('fetch', fetchMock)
  await productCatalog.load()
  const { rerender } = render(<CheckoutDialog plan="basic" onClose={() => {}} />)
  expect(screen.getByText('R$ 12,90')).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: /Consultando disponibilidade/ }),
  ).not.toBeInTheDocument()
  rerender(<CheckoutDialog plan="complete" onClose={() => {}} />)
  expect(screen.getByText('R$ 27,90')).toBeInTheDocument()
  await act(async () => {})
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

it('seleciona o plano de partituras para violino e usa o preço consultado no servidor', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      response({
        checkoutEnabled: true,
        products: products.map((p) => ({ ...p, priceCents: 1990 })),
      }),
    ),
  )
  render(<CheckoutDialog plan="basic" onClose={() => {}} />)
  const button = await screen.findByRole('button', { name: 'Continuar para o pagamento' })
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  expect(screen.getByText('Violino · Partituras')).toBeInTheDocument()
  expect(screen.getByText(violinOffers[0].description)).toBeInTheDocument()
  expect(screen.getByText('R$ 19,90')).toBeInTheDocument()
  expect(button).toBeDisabled()
  await userEvent.type(screen.getByLabelText('E-mail para receber seu acesso'), 'buyer@gmail.com')
  expect(button).toBeEnabled()
})

it('bloqueia o envio quando as vendas estão fechadas', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => response({ checkoutEnabled: false, products })),
  )
  render(<CheckoutDialog plan="complete" onClose={() => {}} />)
  expect(await screen.findByText(/As compras ainda não estão disponíveis/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Continuar para o pagamento' })).toBeDisabled()
})

it('envia produto e e-mail de entrega, impede cliques repetidos e apresenta falha recuperável', async () => {
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
  render(<CheckoutDialog plan="complete" onClose={() => {}} />)
  const user = userEvent.setup()
  const button = await screen.findByRole('button', { name: 'Continuar para o pagamento' })
  await user.type(screen.getByLabelText('E-mail para receber seu acesso'), 'buyer@gmail.com')
  await waitFor(() => expect(button).toBeEnabled())
  await user.dblClick(button)
  expect(fetchMock).toHaveBeenCalledTimes(2)
  const init = fetchMock.mock.calls[1][1]
  expect(JSON.parse(init.body)).toEqual({
    productId: 'library-violin-playbacks',
    email: 'buyer@gmail.com',
    expectedPriceCents: 2790,
  })
  expect(init.headers['Idempotency-Key']).toMatch(/^[a-f\d-]{36}$/)
  expect(init.headers['X-Checkout-Token']).toHaveLength(64)
  expect(screen.getByRole('button', { name: /Abrindo pagamento/ })).toBeDisabled()
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
  expect(screen.getByRole('link', { name: 'Continuar para o pagamento' })).toHaveAttribute(
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
  expect(screen.queryByRole('link', { name: 'Continuar para o pagamento' })).not.toBeInTheDocument()
})

it('exibe e copia o link pessoal após confirmação e liberação do acesso', async () => {
  const id = crypto.randomUUID()
  const personalLink = `${window.location.origin}/biblioteca#id=${crypto.randomUUID()}&acesso=${'f'.repeat(64)}`
  sessionStorage.setItem(`ml:order:${id}`, 'a'.repeat(64))
  window.history.replaceState({}, '', `/checkout/success?order=${id}`)
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      response({
        orderId: id,
        productName: 'Biblioteca de Violino',
        status: 'APPROVED',
        accessReady: true,
        emailSent: true,
        personalLink,
      }),
    ),
  )
  const user = userEvent.setup()
  render(<CheckoutReturn />)
  expect(
    await screen.findByRole('heading', { name: 'Pagamento confirmado. Seu acesso está pronto!' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Acessar minha biblioteca' })).toHaveAttribute(
    'href',
    personalLink,
  )
  expect(screen.getByLabelText('Seu endereço de acesso')).toHaveValue(personalLink)
  await user.click(screen.getByRole('button', { name: 'Copiar meu link' }))
  expect(await navigator.clipboard.readText()).toBe(personalLink)
  expect(screen.getByText('Link copiado!')).toBeInTheDocument()
})

it.each([
  [
    'PENDING',
    false,
    `${window.location.origin}/biblioteca#id=${crypto.randomUUID()}&acesso=${'f'.repeat(64)}`,
  ],
  [
    'REFUNDED',
    false,
    `${window.location.origin}/biblioteca#id=${crypto.randomUUID()}&acesso=${'f'.repeat(64)}`,
  ],
  ['APPROVED', true, 'https://untrusted.example/biblioteca#id=secret'],
])(
  'não exibe link pessoal com status %s ou endereço externo',
  async (status, accessReady, personalLink) => {
    const id = crypto.randomUUID()
    sessionStorage.setItem(`ml:order:${id}`, 'a'.repeat(64))
    window.history.replaceState({}, '', `/checkout/success?order=${id}`)
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        response({
          orderId: id,
          productName: 'Biblioteca de Violino',
          status,
          accessReady,
          emailSent: true,
          personalLink,
        }),
      ),
    )
    render(<CheckoutReturn />)
    await screen.findByText('Biblioteca de Violino')
    expect(screen.queryByLabelText('Seu endereço de acesso')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Acessar minha biblioteca' })).toHaveAttribute(
      'href',
      '/biblioteca',
    )
  },
)

it('atualiza o total quando a condição muda e exige novo clique antes de enviar ao pagamento', async () => {
  const fetchMock = vi
    .fn()
    .mockImplementationOnce(() => response({ checkoutEnabled: true, products }))
    .mockImplementationOnce(() =>
      response(
        {
          code: 'PRODUCT_PRICE_CHANGED',
          message: 'O valor mudou. Confira o total atualizado antes de continuar.',
        },
        409,
      ),
    )
    .mockImplementationOnce(() =>
      response({
        checkoutEnabled: true,
        products: products.map((product) => ({
          ...product,
          priceCents: product.id === 'library-violin-playbacks' ? 4990 : product.priceCents,
        })),
      }),
    )
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<CheckoutDialog plan="complete" onClose={() => {}} />)
  const button = await screen.findByRole('button', { name: 'Continuar para o pagamento' })
  await user.type(screen.getByLabelText('E-mail para receber seu acesso'), 'buyer@gmail.com')
  await waitFor(() => expect(button).toBeEnabled())
  await user.click(button)
  expect(await screen.findByRole('alert')).toHaveTextContent('O valor mudou.')
  expect(screen.getByText('R$ 49,90')).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledTimes(3)
  expect(button).toBeEnabled()
})
