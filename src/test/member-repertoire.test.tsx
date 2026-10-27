import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { MemberRepertoire } from '../components/MemberRepertoire'
import type { MemberLibraryData } from '../../shared/library'

vi.mock('../components/ScorePdf', () => ({
  ScorePdf: ({ url, title }: { url: string; title: string }) => (
    <div title={title} data-url={url} />
  ),
}))

const data: MemberLibraryData = {
  products: [{ id: 'library-violin', name: 'Biblioteca de Violino' }],
  assets: [
    {
      id: 'score-png',
      title: 'Fix You - imagem',
      songTitle: 'Fix You',
      artist: 'Coldplay',
      style: 'Pop internacional',
      instrument: 'violin',
      kind: 'score',
      format: 'png',
    },
    {
      id: 'score-pdf',
      title: 'Fix You - PDF',
      songTitle: 'Fix You',
      artist: 'Coldplay',
      style: 'Pop internacional',
      instrument: 'violin',
      kind: 'score',
      format: 'pdf',
    },
    {
      id: 'audio',
      title: 'Fix You - acompanhamento',
      songTitle: 'Fix You',
      artist: 'Coldplay',
      style: 'Pop internacional',
      instrument: 'violin',
      kind: 'audio',
      format: 'mp3',
    },
    {
      id: 'other',
      title: 'Estudo',
      songTitle: 'Canção de estudo',
      artist: '',
      style: 'Estudo',
      instrument: 'cello',
      kind: 'score',
      format: 'pdf',
    },
  ],
}
afterEach(() => vi.unstubAllGlobals())

it('reúne áudio e partituras por música e filtra por nome, artista, instrumento e estilo', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  render(<MemberRepertoire data={data} token="test-token" />)
  const user = userEvent.setup()
  expect(screen.getAllByRole('row')).toHaveLength(3)
  const row = screen.getByRole('row', { name: /Fix You/ })
  expect(within(row).getByRole('button', { name: /Abrir áudio/ })).toBeInTheDocument()
  expect(within(row).getByRole('button', { name: /Ver partitura/ })).toBeInTheDocument()
  await user.type(screen.getByRole('searchbox'), 'coldplay')
  expect(screen.getAllByRole('row')).toHaveLength(2)
  await user.clear(screen.getByRole('searchbox'))
  await user.selectOptions(screen.getByRole('combobox', { name: 'Instrumento' }), 'cello')
  expect(screen.queryByRole('row', { name: /Fix You/ })).not.toBeInTheDocument()
  await user.selectOptions(screen.getByRole('combobox', { name: 'Estilo' }), 'Pop internacional')
  expect(screen.getByText('Nenhuma música encontrada.')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
  await user.type(screen.getByRole('searchbox'), 'cancao')
  expect(screen.getByRole('row', { name: /Canção de estudo/ })).toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()
})

it('preserva o áudio, a partitura e o zoom ao renovar o token e usa a nova credencial na próxima solicitação', async () => {
  const fetchMock = vi.fn(
    async (input: string, _init?: RequestInit) =>
      new Response(
        JSON.stringify({
          url: `https://storage.example.test/${input.includes('audio') ? 'track.mp3' : 'score.png'}`,
        }),
      ),
  )
  vi.stubGlobal('fetch', fetchMock)
  const mounted = render(<MemberRepertoire data={data} token="initial-test-token" />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Ver partitura de Fix You' }))
  const image = await screen.findByRole('img', { name: 'Fix You - imagem' })
  await waitFor(() =>
    expect(document.querySelector('audio')).toHaveAttribute(
      'src',
      'https://storage.example.test/track.mp3',
    ),
  )
  const audio = document.querySelector('audio')!
  audio.currentTime = 40
  await user.selectOptions(screen.getByRole('combobox', { name: 'Zoom da partitura' }), '150')
  const requests = fetchMock.mock.calls.length
  mounted.rerender(<MemberRepertoire data={data} token="renewed-test-token" />)
  expect(screen.getByRole('img', { name: 'Fix You - imagem' })).toBe(image)
  expect(document.querySelector('audio')).toBe(audio)
  expect(audio.currentTime).toBe(40)
  expect(screen.getByRole('combobox', { name: 'Zoom da partitura' })).toHaveValue('150')
  expect(fetchMock).toHaveBeenCalledTimes(requests)
  await user.click(screen.getAllByRole('button', { name: 'Renovar acesso ao arquivo' })[0])
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(requests + 1))
  expect(fetchMock.mock.calls.at(-1)?.[1]).toMatchObject({
    headers: { Authorization: 'Bearer renewed-test-token' },
  })
})

it('abre áudio e PNG na plataforma, permite trocar para PDF e renova URLs autenticadas', async () => {
  const fetchMock = vi.fn(
    async (input: string) =>
      new Response(
        JSON.stringify({
          url: `https://storage.example.test/${input.includes('audio') ? 'track.mp3' : input.includes('score-pdf') ? 'score.pdf' : 'score.png'}`,
        }),
      ),
  )
  vi.stubGlobal('fetch', fetchMock)
  render(<MemberRepertoire data={data} token="test-token" />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Ver partitura de Fix You' }))
  const image = await screen.findByRole('img', { name: 'Fix You - imagem' })
  expect(image).toHaveAttribute('src', 'https://storage.example.test/score.png')
  await waitFor(() =>
    expect(document.querySelector('audio')).toHaveAttribute(
      'src',
      'https://storage.example.test/track.mp3',
    ),
  )
  expect(document.querySelector('audio')).toHaveAttribute('controls')
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/score-png/view'),
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } }),
  )
  await user.selectOptions(screen.getByRole('combobox', { name: 'Zoom da partitura' }), '200')
  expect(image).toHaveStyle({ width: '200%' })
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Escolher partitura' }),
    'score-pdf',
  )
  expect(await screen.findByTitle('Fix You - PDF')).toHaveAttribute(
    'data-url',
    'https://storage.example.test/score.pdf',
  )
  const calls = fetchMock.mock.calls.length
  await user.click(screen.getAllByRole('button', { name: 'Renovar acesso ao arquivo' })[1])
  await waitFor(() => expect(fetchMock.mock.calls.length).toBe(calls + 1))
  await user.click(screen.getByRole('button', { name: 'Fechar materiais' }))
  expect(document.querySelector('audio')).not.toBeInTheDocument()
  expect(screen.queryByTitle('Fix You - PDF')).not.toBeInTheDocument()
})

it('mostra recusa de acesso e permite repetir sem deixar arquivo aberto', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify({ message: 'Sua sessão expirou.', code: 'LOGIN_REQUIRED' }), {
          status: 401,
        }),
    ),
  )
  render(<MemberRepertoire data={{ ...data, assets: [data.assets[0]] }} token="expired" />)
  await userEvent.click(screen.getByRole('button', { name: 'Ver partitura de Fix You' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Sua sessão expirou.')
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
})

it('ordena a coleção e filtra músicas com áudio sem novas consultas', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  render(<MemberRepertoire data={data} token="test-token" />)
  const user = userEvent.setup()
  await user.selectOptions(screen.getByRole('combobox', { name: 'Ordenar por' }), 'title-desc')
  expect(screen.getAllByRole('row')[1]).toHaveTextContent('Fix You')
  await user.click(screen.getByRole('checkbox', { name: /Somente com áudio/ }))
  expect(screen.getAllByRole('row')).toHaveLength(2)
  expect(screen.queryByRole('row', { name: /Canção de estudo/ })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
  expect(screen.getAllByRole('row')).toHaveLength(3)
  expect(fetchMock).not.toHaveBeenCalled()
})

it('amplia a área de estudo e volta à lista mantendo a partitura aberta', async () => {
  const fetchMock = vi.fn(
    async () => new Response(JSON.stringify({ url: 'https://storage.example.test/score.png' })),
  )
  vi.stubGlobal('fetch', fetchMock)
  render(<MemberRepertoire data={{ ...data, assets: [data.assets[0]] }} token="test-token" />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Ver partitura de Fix You' }))
  const image = await screen.findByRole('img', { name: 'Fix You - imagem' })
  await user.selectOptions(screen.getByRole('combobox', { name: 'Zoom da partitura' }), '150')
  await user.click(screen.getByRole('button', { name: 'Ampliar área de estudo' }))
  expect(screen.getByRole('region', { name: 'Repertório disponível' })).toHaveClass('is-focus-mode')
  await user.click(screen.getByRole('button', { name: 'Mostrar lista de músicas' }))
  expect(screen.getByRole('img', { name: 'Fix You - imagem' })).toBe(image)
  expect(screen.getByRole('combobox', { name: 'Zoom da partitura' })).toHaveValue('150')
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
