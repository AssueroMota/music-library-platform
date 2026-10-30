import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ProductCatalog } from '../lib/product-catalog'
import { violinLaunch } from '../../shared/violin-launch'

const products = { checkoutEnabled: true, products: [] }
const response = (body: unknown = products) => new Response(JSON.stringify(body))
let catalog: ProductCatalog

beforeEach(() => {
  catalog = new ProductCatalog()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-30T12:00:00-03:00'))
})

afterEach(() => {
  catalog.invalidate()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('compartilha uma única consulta entre a entrada da página e o checkout', async () => {
  let finish!: (value: Response) => void
  const fetchMock = vi.fn(
    (_url: string, _init?: RequestInit) => new Promise<Response>((resolve) => (finish = resolve)),
  )
  vi.stubGlobal('fetch', fetchMock)
  catalog.prefetch()
  catalog.prefetch()
  const checkout = catalog.load()
  expect(fetchMock).toHaveBeenCalledTimes(1)
  finish(response())
  await expect(checkout).resolves.toEqual(products)
  expect(catalog.peek()).toEqual(products)
  await catalog.load()
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock.mock.calls[0][1]?.method).toBeUndefined()
})

it('consulta novamente após um minuto sem manter o catálogo antigo', async () => {
  const fetchMock = vi.fn(async () => response())
  vi.stubGlobal('fetch', fetchMock)
  await catalog.load()
  vi.setSystemTime(Date.now() + 59999)
  expect(catalog.peek()).toEqual(products)
  vi.setSystemTime(Date.now() + 1)
  expect(catalog.peek()).toBeNull()
  await catalog.load()
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

it.each([violinLaunch.startsAt, violinLaunch.endsAt])(
  'expira o catálogo na mudança de preço de %s, mesmo antes de um minuto',
  async (boundary) => {
    const fetchMock = vi.fn(async () => response())
    vi.stubGlobal('fetch', fetchMock)
    vi.setSystemTime(Date.parse(boundary) - 1000)
    await catalog.load()
    vi.setSystemTime(Date.parse(boundary))
    expect(catalog.peek()).toBeNull()
    await catalog.load()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  },
)

it('permite tentar de novo depois de falha na consulta antecipada', async () => {
  const fetchMock = vi
    .fn()
    .mockRejectedValueOnce(new TypeError('offline'))
    .mockResolvedValueOnce(response())
  vi.stubGlobal('fetch', fetchMock)
  catalog.prefetch()
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  await vi.runAllTimersAsync()
  expect(catalog.peek()).toBeNull()
  await expect(catalog.load()).resolves.toEqual(products)
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

it('descarta a resposta anterior ao atualizar preços e mantém apenas o catálogo novo', async () => {
  let finishOld!: (value: Response) => void
  const current = { checkoutEnabled: false, products: [] }
  const fetchMock = vi
    .fn()
    .mockImplementationOnce(() => new Promise<Response>((resolve) => (finishOld = resolve)))
    .mockResolvedValueOnce(response(current))
  vi.stubGlobal('fetch', fetchMock)
  const old = catalog.load()
  await catalog.load({ refresh: true })
  finishOld(response())
  await old
  expect(catalog.peek()).toEqual(current)
  expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true)
})

it('substitui consulta pendente que começou antes do fim da promoção', async () => {
  let finishOld!: (value: Response) => void
  const fetchMock = vi
    .fn()
    .mockImplementationOnce(() => new Promise<Response>((resolve) => (finishOld = resolve)))
    .mockResolvedValueOnce(response())
  vi.stubGlobal('fetch', fetchMock)
  vi.setSystemTime(Date.parse(violinLaunch.endsAt) - 1000)
  const old = catalog.load()
  vi.setSystemTime(Date.parse(violinLaunch.endsAt))
  await catalog.load()
  finishOld(response({ checkoutEnabled: false, products: [] }))
  await old
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(catalog.peek()).toEqual(products)
})
