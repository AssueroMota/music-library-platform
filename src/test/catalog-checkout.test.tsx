import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { CatalogCheckout } from '../components/CatalogCheckout'
import { violinCatalog } from '../data/catalog-songs'
import { productCatalog } from '../lib/product-catalog'
import { violinOffers } from '../../shared/products'

function viewSong(title: string, query: string) {
  const song = violinCatalog.find((item) => item.title === title)!
  const params = new URLSearchParams({ musica: song.id, q: query })
  window.history.replaceState({}, '', `/checkout/partitura?${params}`)
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            checkoutEnabled: true,
            products: violinOffers.map((offer) => ({ ...offer, available: true })),
          }),
        ),
    ),
  )
  render(<CatalogCheckout />)
}

afterEach(() => {
  window.history.replaceState({}, '', '/')
  productCatalog.invalidate()
  vi.unstubAllGlobals()
})

it('mostra a música pesquisada, permite escolher o plano e oferece seu material grátis', async () => {
  viewSong('Perfect', 'Ed Sheeran')
  expect(screen.getByRole('heading', { name: 'Perfect' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Voltar ao catálogo' })).toHaveAttribute(
    'href',
    '/partituras-para-violino?q=Ed+Sheeran#musicas',
  )
  expect(
    screen.getByText('A partitura e o playback desta música estão no teste grátis.'),
  ).toBeVisible()
  expect(await screen.findByText('R$ 12,90')).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Escolha seu plano'), { target: { value: 'complete' } })
  expect(await screen.findByText('R$ 27,90')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Testar de graça' }))
  expect(screen.getByLabelText('E-mail para receber seu acesso grátis')).toBeVisible()
})

it('oferece o Completo e a seleção grátis quando a música só tem versão guiada', async () => {
  viewSong('Careless Whisper', 'George Michael')
  expect(screen.queryByLabelText('Escolha seu plano')).not.toBeInTheDocument()
  expect(screen.getByText('Partitura guiada no Plano Completo')).toBeVisible()
  expect(await screen.findByText('R$ 27,90')).toBeInTheDocument()
  expect(screen.getByText(/Conheça a biblioteca com uma seleção/)).toBeVisible()
})
