import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { FreeLibraryDialog } from '../components/FreeLibraryDialog'
import { PricingSection } from '../components/PricingSection'
import { MemberRepertoire } from '../components/MemberRepertoire'
import type { MemberLibraryData } from '../../shared/library'
import { productCatalog } from '../lib/product-catalog'

afterEach(() => {
  vi.restoreAllMocks()
  productCatalog.invalidate()
})

it('oferece a opção Grátis antes dos planos e abre o cadastro sem iniciar checkout', async () => {
  const onFree = vi.fn(),
    onCheckout = vi.fn()
  const user = userEvent.setup()
  render(<PricingSection onCheckout={onCheckout} onFree={onFree} />)
  const free = screen.getByRole('article', { name: 'Plano Grátis' })
  expect(within(free).getByText('2 partituras para violino')).toBeInTheDocument()
  expect(within(free).getByText('2 partituras guiadas em vídeo')).toBeInTheDocument()
  expect(within(free).getByText('Sem setlists personalizados')).toBeInTheDocument()
  await user.click(within(free).getByRole('button', { name: 'Quero testar de graça' }))
  expect(onFree).toHaveBeenCalledOnce()
  expect(onCheckout).not.toHaveBeenCalled()
})

it('solicita o acesso por e-mail e confirma a solicitação sem pagamento nem link privado na resposta', async () => {
  const fetchMock = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(
      new Response(
        JSON.stringify({ message: 'Confira seu e-mail para acessar a versão grátis.' }),
        { status: 202 },
      ),
    )
  const user = userEvent.setup()
  render(<FreeLibraryDialog open onClose={() => {}} />)
  const dialog = screen.getByRole('dialog', { name: 'Experimente de graça.' })
  const submit = within(dialog).getByRole('button', { name: 'Receber meu acesso grátis' })
  expect(submit).toBeDisabled()
  await user.type(
    within(dialog).getByLabelText('E-mail para receber seu acesso grátis'),
    'Trial@Example.Test',
  )
  await user.click(submit)
  expect(fetchMock).toHaveBeenCalledOnce()
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/api/library/free'),
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'trial@example.test' }),
    }),
  )
  expect(await within(dialog).findByRole('status')).toHaveTextContent('Confira seu e-mail')
  expect(within(dialog).queryByRole('button', { name: /pagamento/i })).not.toBeInTheDocument()
})

it('mantém o formulário disponível para tentar novamente se o cadastro falhar', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ message: 'Tente novamente em instantes.' }), { status: 503 }),
  )
  const user = userEvent.setup()
  render(<FreeLibraryDialog open onClose={() => {}} />)
  await user.type(
    screen.getByLabelText('E-mail para receber seu acesso grátis'),
    'trial@example.test',
  )
  await user.click(screen.getByRole('button', { name: 'Receber meu acesso grátis' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Tente novamente')
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Receber meu acesso grátis' })).toBeEnabled(),
  )
})

it('mostra só as duas abas do teste grátis com duas músicas cada, sem setlists ou editor', async () => {
  const user = userEvent.setup()
  const data: MemberLibraryData = {
    setlistLimit: 0,
    freeAccess: true,
    accessMode: 'free',
    products: [],
    assets: [
      ...['A Thousand Years', 'Perfect'].flatMap((songTitle, index) =>
        ['score', 'audio'].map((kind) => ({
          id: `${kind}-${index}`,
          title: songTitle,
          songTitle,
          artist: 'Artista',
          style: 'Pop',
          instrument: 'violin',
          kind,
          format: kind === 'score' ? 'pdf' : 'mp3',
        })),
      ),
      ...['My Way', 'Bondade de Deus'].map((songTitle, index) => ({
        id: `video-${index}`,
        title: songTitle,
        songTitle,
        artist: 'Artista',
        style: 'Pop',
        instrument: 'violin',
        kind: 'video',
        format: 'mp4',
      })),
    ],
  }
  render(<MemberRepertoire data={data} token="free-test-session" />)
  const nav = screen.getByRole('navigation', { name: 'Explorar biblioteca' })
  expect(within(nav).getAllByRole('button')).toHaveLength(2)
  expect(within(nav).getByRole('button', { name: 'Partituras + Playbacks 2' })).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: /Setlists prontos|Meus setlists/ }),
  ).not.toBeInTheDocument()
  expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(2)
  await user.click(within(nav).getByRole('button', { name: 'Partituras guiadas 2' }))
  expect(
    screen
      .getByRole('table', { name: 'Partituras guiadas em vídeo da sua biblioteca' })
      .querySelectorAll('tbody tr'),
  ).toHaveLength(2)
  expect(screen.queryByRole('button', { name: /Criar setlist/ })).not.toBeInTheDocument()
})
