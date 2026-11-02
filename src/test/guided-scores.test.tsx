import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { MemberRepertoire } from '../components/MemberRepertoire'
import { PublicLibraryPreview } from '../components/PublicLibraryPreview'
import type { MemberLibraryData } from '../../shared/library'
import { guidedScoreCount } from '../../shared/guided-scores'

const data: MemberLibraryData = {
  products: [],
  setlistLimit: 42,
  assets: [
    {
      id: 'pdf',
      title: 'Perfect',
      songTitle: 'Perfect',
      artist: 'Ed Sheeran',
      style: 'Pop',
      instrument: 'violin',
      kind: 'score',
      format: 'pdf',
    },
    {
      id: 'video-1',
      title: 'Bênçãos - Partitura guiada',
      songTitle: 'Bênçãos Que Não Têm Fim',
      artist: 'Isadora Pompeo',
      style: 'Gospel',
      instrument: 'violin',
      kind: 'video',
      format: 'mp4',
    },
    {
      id: 'video-2',
      title: 'My Way - Partitura guiada',
      songTitle: 'My Way',
      artist: 'Frank Sinatra',
      style: 'Pop',
      instrument: 'violin',
      kind: 'video',
      format: 'mp4',
    },
  ],
}
afterEach(() => vi.unstubAllGlobals())

it('separa vídeos das partituras e dos setlists, busca sem acentos e abre somente o vídeo escolhido', async () => {
  const fetchMock = vi.fn(
    async () => new Response(JSON.stringify({ url: 'https://storage.example.test/video.mp4' })),
  )
  vi.stubGlobal('fetch', fetchMock)
  const { container } = render(<MemberRepertoire data={data} token="member-token" />)
  const user = userEvent.setup()
  expect(container.querySelectorAll('.repertoire-table tbody tr')).toHaveLength(1)
  await user.click(screen.getByRole('button', { name: /Setlists prontos/ }))
  expect(screen.queryByText('My Way')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Partituras guiadas 2' }))
  expect(fetchMock).not.toHaveBeenCalled()
  await user.type(screen.getByRole('searchbox'), 'bencaos')
  expect(screen.queryByRole('button', { name: 'Assistir My Way' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Assistir Bênçãos Que Não Têm Fim' }))
  await waitFor(() =>
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      'https://storage.example.test/video.mp4',
    ),
  )
  expect(container.querySelector('video')).toHaveAttribute('controls')
  expect(container.querySelector('video')).toHaveAttribute('playsinline')
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/library/assets/video-1/view'),
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer member-token' }),
    }),
  )
  await user.click(screen.getByRole('button', { name: /^Partituras \d/ }))
  expect(container.querySelector('video')).not.toBeInTheDocument()
})

it('permite renovar o acesso após erro ao carregar um vídeo e trocar de vídeo', async () => {
  const fetchMock = vi.fn(
    async () => new Response(JSON.stringify({ url: 'https://storage.example.test/video.mp4' })),
  )
  vi.stubGlobal('fetch', fetchMock)
  const { container } = render(<MemberRepertoire data={data} token="member-token" />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /Partituras guiadas/ }))
  await user.click(screen.getByRole('button', { name: 'Assistir My Way' }))
  await waitFor(() => expect(container.querySelector('video')).not.toBeNull())
  fireEvent.error(container.querySelector('video')!)
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar')
  await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  await waitFor(() => expect(container.querySelector('video')).not.toBeNull())
  const previousVideo = container.querySelector('video')!
  await user.click(screen.getByRole('button', { name: 'Assistir Bênçãos Que Não Têm Fim' }))
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
  expect(container.querySelectorAll('video')).toHaveLength(1)
  expect(vi.mocked(HTMLMediaElement.prototype.pause).mock.contexts).toContain(previousVideo)
  const currentVideo = container.querySelector('video')!
  await user.click(screen.getByRole('button', { name: 'Fechar vídeo' }))
  expect(container.querySelector('video')).toBeNull()
  expect(vi.mocked(HTMLMediaElement.prototype.pause).mock.contexts).toContain(currentVideo)
})

it('mostra o bônus somente na demonstração do Completo sem solicitar links privados', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  const { container } = render(<PublicLibraryPreview />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Básico · Partituras e 10 setlists' }))
  expect(screen.queryByRole('button', { name: /Partituras guiadas/ })).not.toBeInTheDocument()
  expect(
    screen.queryByRole('table', { name: 'Partituras guiadas em vídeo da sua biblioteca' }),
  ).toBeNull()
  await user.click(screen.getByRole('button', { name: 'Completo · Playbacks e 42 setlists' }))
  await user.click(screen.getByRole('button', { name: `Partituras guiadas ${guidedScoreCount}` }))
  expect(
    within(
      screen.getByRole('table', { name: 'Partituras guiadas em vídeo da sua biblioteca' }),
    ).getAllByRole('row'),
  ).toHaveLength(guidedScoreCount + 1)
  await user.click(screen.getByRole('button', { name: 'Assistir My Way' }))
  expect(
    within(screen.getByRole('region', { name: 'Vídeo de My Way' })).getByText(
      /Entre na sua biblioteca para assistir\./,
    ),
  ).toBeInTheDocument()
  expect(container.querySelector('video')).toBeNull()
  expect(fetchMock).not.toHaveBeenCalled()
})

it('usa tabela com estilo, combina filtros e restaura a lista ao limpar', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  render(<MemberRepertoire data={data} token="member-token" />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Partituras guiadas 2' }))
  const table = screen.getByRole('table', { name: 'Partituras guiadas em vídeo da sua biblioteca' })
  expect(
    within(table)
      .getAllByRole('columnheader')
      .map((cell) => cell.textContent),
  ).toEqual(['Música', 'Estilo', 'Materiais'])
  expect(within(table).getAllByRole('row')).toHaveLength(3)
  await user.selectOptions(screen.getByRole('combobox', { name: 'Estilo' }), 'Gospel')
  expect(within(table).getAllByRole('row')).toHaveLength(2)
  expect(screen.queryByRole('button', { name: 'Assistir My Way' })).toBeNull()
  await user.type(screen.getByRole('searchbox'), 'Sinatra')
  expect(screen.getByRole('heading', { name: 'Nenhum vídeo encontrado.' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
  expect(screen.getByRole('searchbox')).toHaveValue('')
  expect(screen.getByRole('combobox', { name: 'Estilo' })).toHaveValue('')
  expect(screen.getByRole('button', { name: 'Assistir My Way' })).toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()
})

it('abre o painel de estudo pela música, amplia e devolve o foco ao fechar', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () => new Response(JSON.stringify({ url: 'https://storage.example.test/video.mp4' })),
    ),
  )
  const { container } = render(<MemberRepertoire data={data} token="member-token" />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /Partituras guiadas/ }))
  const trigger = screen.getByRole('button', { name: 'Abrir partitura guiada de My Way' })
  await user.click(trigger)
  const workspace = screen.getByRole('region', { name: 'Vídeo de My Way' })
  expect(within(workspace).getByRole('heading', { name: 'My Way' })).toHaveFocus()
  expect(within(workspace).queryByRole('combobox')).toBeNull()
  await user.click(screen.getByRole('button', { name: 'Ampliar área de estudo' }))
  expect(container.querySelector('.guided-scores')).toHaveClass('is-focus-mode')
  await user.click(screen.getByRole('button', { name: 'Mostrar lista de músicas' }))
  expect(container.querySelector('.guided-scores')).not.toHaveClass('is-focus-mode')
  await user.click(screen.getByRole('button', { name: 'Fechar vídeo' }))
  expect(trigger).toHaveFocus()
})
