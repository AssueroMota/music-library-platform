import { act, fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { MemberRepertoire } from '../components/MemberRepertoire'
import type { MemberLibraryData } from '../../shared/library'
import type { CustomSetlist } from '../../shared/custom-setlists'
import { isSetlistExpired, setlistToday } from '../../shared/custom-setlists'

vi.mock('../components/ProtectedMedia', () => ({
  ProtectedMedia: ({ asset }: { asset: { title: string } }) => <p>Material: {asset.title}</p>,
}))

const john = { title: 'All of Me', artist: 'John Legend', instrument: 'violin' }
const frank = { title: 'All of Me', artist: 'Frank Sinatra', instrument: 'violin' }
const fix = { title: 'Fix You', artist: 'Coldplay', instrument: 'violin' }
const data: MemberLibraryData = {
  setlistLimit: 10,
  products: [],
  assets: [
    ...[john, frank, fix].map((song, index) => ({
      ...song,
      songTitle: song.title,
      id: `score-${index}`,
      style: 'Pop',
      kind: 'score',
      format: 'pdf',
    })),
    { ...fix, songTitle: fix.title, id: 'audio', style: 'Pop', kind: 'audio', format: 'mp3' },
    {
      ...fix,
      songTitle: 'Vídeo exclusivo',
      id: 'video',
      style: 'Pop',
      kind: 'video',
      format: 'mp4',
    },
  ],
}

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

function setup(initial: CustomSetlist[] = []) {
  let stored = initial
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    if (init?.method === 'POST' || init?.method === 'PUT') {
      const saved = { id: 'saved-1', ...JSON.parse(init.body as string) } as CustomSetlist
      stored = [saved]
      return new Response(JSON.stringify(saved))
    }
    if (init?.method === 'DELETE') {
      stored = []
      return new Response(JSON.stringify({ deleted: true }))
    }
    return new Response(JSON.stringify({ setlists: stored }))
  })
  vi.stubGlobal('fetch', fetchMock)
  return { user: userEvent.setup(), fetchMock }
}

it('cria com versões distintas, reordena, persiste na conta, reabre e edita sem misturar áudio ou vídeo no básico', async () => {
  const { user, fetchMock } = setup()
  const first = render(<MemberRepertoire data={data} token="member-token" />)
  expect(fetchMock).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Meus setlists' }))
  expect(await screen.findByText('Seu repertório, do seu jeito.')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Criar setlist' }))
  await user.type(screen.getByRole('textbox', { name: 'Nome do setlist' }), 'Meu casamento')
  expect(screen.getByRole('button', { name: 'Salvar setlist' })).toBeDisabled()
  expect(screen.queryByText('Vídeo exclusivo')).not.toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: /^Adicionar All of Me/ })).toHaveLength(2)
  await user.click(screen.getByRole('button', { name: 'Adicionar All of Me de John Legend' }))
  expect(screen.getByRole('button', { name: 'Adicionar All of Me de John Legend' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'Adicionar All of Me de Frank Sinatra' }))
  await user.click(screen.getAllByRole('button', { name: 'Mover All of Me para baixo' })[0])
  const order = screen.getByRole('list', { name: 'Ordem das músicas' })
  expect(
    within(order)
      .getAllByRole('listitem')
      .map((item) => item.textContent),
  ).toEqual([expect.stringContaining('Frank Sinatra'), expect.stringContaining('John Legend')])
  await user.click(screen.getByRole('button', { name: 'Salvar setlist' }))
  expect(await screen.findByRole('status')).toHaveTextContent('Setlist salvo na sua conta.')
  const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')!
  expect(call[1]?.headers).toMatchObject({ Authorization: 'Bearer member-token' })
  expect(JSON.parse(call[1]?.body as string)).toMatchObject({
    title: 'Meu casamento',
    songs: [frank, john],
  })
  first.unmount()
  render(<MemberRepertoire data={data} token="renewed-token" />)
  await user.click(screen.getByRole('button', { name: 'Meus setlists' }))
  await user.click(await screen.findByRole('button', { name: 'Abrir meu setlist Meu casamento' }))
  const savedOrder = screen.getByRole('list', { name: 'Músicas do setlist personalizado' })
  await user.click(
    within(savedOrder).getAllByRole('button', { name: 'Abrir materiais de All of Me' })[0],
  )
  expect(screen.getByRole('dialog', { name: 'Materiais de All of Me' })).toHaveTextContent(
    'Material: All of Me',
  )
  await user.click(screen.getByRole('button', { name: 'Fechar materiais' }))
  await user.click(screen.getByRole('button', { name: 'Editar setlist' }))
  await user.clear(screen.getByRole('textbox', { name: 'Nome do setlist' }))
  await user.type(screen.getByRole('textbox', { name: 'Nome do setlist' }), 'Show')
  await user.click(screen.getAllByRole('button', { name: 'Remover All of Me' })[0])
  await user.click(screen.getByRole('button', { name: 'Salvar setlist' }))
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Show' })).toBeInTheDocument())
  expect(
    JSON.parse(
      fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT').at(-1)![1]?.body as string,
    ),
  ).toMatchObject({ title: 'Show', songs: [john], status: 'ready' })
})

it('mantém o rascunho após falha e permite tentar novamente sem confirmação', async () => {
  const { user, fetchMock } = setup([{ id: 'saved-1', title: 'Original', songs: [fix] }])
  render(<MemberRepertoire data={data} token="member-token" />)
  await user.click(screen.getByRole('button', { name: 'Meus setlists' }))
  await user.click(await screen.findByRole('button', { name: 'Abrir meu setlist Original' }))
  await user.click(screen.getByRole('button', { name: 'Editar setlist' }))
  await user.type(screen.getByRole('textbox', { name: 'Nome do setlist' }), ' editado')
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ message: 'Falha ao salvar.' }), { status: 503 }),
  )
  await user.click(screen.getByRole('button', { name: 'Salvar setlist' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao salvar.')
  expect(screen.getByRole('textbox', { name: 'Nome do setlist' })).toHaveValue('Original editado')
  await user.click(screen.getByRole('button', { name: 'Salvar setlist' }))
  expect(await screen.findByRole('heading', { name: 'Original editado' })).toBeInTheDocument()
})

it('exige confirmação para excluir, preserva o setlist na falha e permite tentar novamente', async () => {
  const { user, fetchMock } = setup([{ id: 'saved-1', title: 'Show', songs: [fix] }])
  render(<MemberRepertoire data={data} token="member-token" />)
  await user.click(screen.getByRole('button', { name: 'Meus setlists' }))
  await user.click(await screen.findByRole('button', { name: 'Abrir meu setlist Show' }))
  await user.click(screen.getByRole('button', { name: 'Excluir setlist' }))
  await user.click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(false)
  await user.click(screen.getByRole('button', { name: 'Excluir setlist' }))
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ message: 'Falha ao excluir.' }), { status: 503 }),
  )
  await user.click(screen.getByRole('button', { name: 'Confirmar exclusão' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao excluir.')
  expect(screen.getByRole('heading', { name: 'Show' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Confirmar exclusão' }))
  expect(await screen.findByRole('status')).toHaveTextContent('Setlist excluído.')
  expect(screen.getByText('Seu repertório, do seu jeito.')).toBeInTheDocument()
})

it('mantém músicas indisponíveis identificadas e exige removê-las antes de salvar', async () => {
  const missing = { title: 'Música removida', artist: 'Artista', instrument: 'cello' }
  const { user } = setup([{ id: 'saved-1', title: 'Antigo', songs: [missing, fix] }])
  render(<MemberRepertoire data={data} token="member-token" />)
  await user.click(screen.getByRole('button', { name: 'Meus setlists' }))
  await user.click(await screen.findByRole('button', { name: 'Abrir meu setlist Antigo' }))
  expect(
    screen.queryByRole('button', { name: 'Abrir materiais de Música removida' }),
  ).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Editar setlist' }))
  expect(screen.getByRole('button', { name: 'Salvar setlist' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'Remover Música removida' }))
  expect(screen.getByRole('button', { name: 'Salvar setlist' })).toBeEnabled()
})

it('mostra falha de carregamento com tentativa nova e não mostra a função na demonstração pública', async () => {
  const { user, fetchMock } = setup()
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ message: 'Sem conexão.' }), { status: 503 }),
  )
  const view = render(<MemberRepertoire data={data} token="member-token" />)
  await user.click(screen.getByRole('button', { name: 'Meus setlists' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Sem conexão.')
  expect(screen.getByRole('button', { name: 'Criar setlist' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  expect(await screen.findByText('Seu repertório, do seu jeito.')).toBeInTheDocument()
  view.unmount()
  render(<MemberRepertoire data={data} token="" previewMedia={{}} />)
  expect(screen.queryByRole('button', { name: 'Meus setlists' })).not.toBeInTheDocument()
})

it('salva rascunho incompleto automaticamente e preserva ao voltar sem confirmar', async () => {
  const { user, fetchMock } = setup()
  render(<MemberRepertoire data={data} token="member-token" />)
  await user.click(screen.getByRole('button', { name: 'Meus setlists' }))
  await user.click(await screen.findByRole('button', { name: 'Criar setlist' }))
  await user.type(screen.getByLabelText('Nome do setlist'), 'Em preparação')
  await waitFor(() =>
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true),
  )
  const body = JSON.parse(
    fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')![1]?.body as string,
  )
  expect(body).toMatchObject({
    title: 'Em preparação',
    songs: [],
    status: 'draft',
    type: 'personal',
    eventDate: null,
  })
  await user.click(screen.getByRole('button', { name: 'Voltar aos meus setlists' }))
  await user.click(await screen.findByRole('button', { name: 'Abrir meu setlist Em preparação' }))
  expect(screen.getByText(/Setlist próprio · Sem vencimento · Rascunho/)).toBeInTheDocument()
})

it('recupera alterações ao recarregar antes do salvamento automático', async () => {
  const { user } = setup()
  const view = render(<MemberRepertoire data={data} token="member-token" />)
  await user.click(screen.getByRole('button', { name: 'Meus setlists' }))
  await user.click(await screen.findByRole('button', { name: 'Criar setlist' }))
  fireEvent.change(screen.getByLabelText('Nome do setlist'), { target: { value: 'Não perder' } })
  view.unmount()
  render(<MemberRepertoire data={data} token="member-token" />)
  await user.click(screen.getByRole('button', { name: 'Meus setlists' }))
  expect(await screen.findByLabelText('Nome do setlist')).toHaveValue('Não perder')
})

it('não perde edições durante requisição lenta nem cria setlists duplicados', async () => {
  const { user, fetchMock } = setup()
  render(<MemberRepertoire data={data} token="member-token" />)
  await user.click(screen.getByRole('button', { name: 'Meus setlists' }))
  await user.click(await screen.findByRole('button', { name: 'Criar setlist' }))
  let finish!: (response: Response) => void
  fetchMock.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        finish = resolve
      }),
  )
  fireEvent.change(screen.getByLabelText('Nome do setlist'), { target: { value: 'Primeiro' } })
  await waitFor(() => expect(finish).toBeDefined())
  const firstBody = JSON.parse(
    fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')![1]?.body as string,
  )
  fireEvent.change(screen.getByLabelText('Nome do setlist'), { target: { value: 'Última edição' } })
  await act(async () => {
    finish(new Response(JSON.stringify(firstBody)))
  })
  await waitFor(() =>
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(1),
  )
  expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(1)
  expect(JSON.parse(fetchMock.mock.calls.at(-1)![1]?.body as string)).toMatchObject({
    id: firstBody.id,
    title: 'Última edição',
  })
})

it('exige data nos eventos, mantém pessoal sem vencimento e permite reativar evento vencido', async () => {
  const { user } = setup([
    {
      id: 'saved-1',
      title: 'Casamento antigo',
      songs: [fix],
      type: 'wedding',
      eventDate: '2000-01-01',
      status: 'ready',
    },
  ])
  render(<MemberRepertoire data={data} token="member-token" />)
  await user.click(screen.getByRole('button', { name: 'Meus setlists' }))
  await screen.findByLabelText('Exibir setlists')
  expect(
    screen.queryByRole('button', { name: 'Abrir meu setlist Casamento antigo' }),
  ).not.toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Exibir setlists'), 'expired')
  await user.click(screen.getByRole('button', { name: 'Abrir meu setlist Casamento antigo' }))
  expect(screen.getByText(/Inativo — evento encerrado/)).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Abrir materiais de Fix You' }),
  ).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Editar setlist' }))
  fireEvent.change(screen.getByLabelText('Data do evento'), { target: { value: '' } })
  expect(screen.getByRole('button', { name: 'Salvar setlist' })).toBeDisabled()
  fireEvent.change(screen.getByLabelText('Data do evento'), { target: { value: '2099-12-12' } })
  await user.click(screen.getByRole('button', { name: 'Salvar setlist' }))
  expect(
    await screen.findByRole('button', { name: 'Abrir materiais de Fix You' }),
  ).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Editar setlist' }))
  await user.selectOptions(screen.getByLabelText('Tipo do setlist'), 'personal')
  expect(screen.getByLabelText('Data do evento')).toBeDisabled()
  expect(screen.getByLabelText('Data do evento')).toHaveValue('')
})

it('vence apenas depois do dia do evento pelo calendário de São Paulo', () => {
  const event = { type: 'event' as const, eventDate: '2026-12-12' }
  expect(setlistToday(new Date('2026-12-13T02:59:59Z'))).toBe('2026-12-12')
  expect(isSetlistExpired(event, '2026-12-12')).toBe(false)
  expect(isSetlistExpired(event, '2026-12-13')).toBe(true)
  expect(isSetlistExpired({ type: 'personal', eventDate: '2000-01-01' }, '2026-12-13')).toBe(false)
  expect(isSetlistExpired({}, '2026-12-13')).toBe(false)
})
