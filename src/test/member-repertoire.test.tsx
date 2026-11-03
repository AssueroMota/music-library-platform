import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { MemberRepertoire } from '../components/MemberRepertoire'
import type { MemberLibraryData } from '../../shared/library'
import { resolveSetlists, resolveViolinSetlists, violinSetlists } from '../data/setlists'
import { publicRepertoire } from '../data/public-repertoire'

vi.mock('../components/ScorePdf', () => ({
  ScorePdf: ({ url, title }: { url: string; title: string }) => (
    <div title={title} data-url={url} />
  ),
}))

it('oferece dez setlists ordenados sem incluir músicas de outro instrumento ou fora do acesso', () => {
  expect(violinSetlists).toHaveLength(10)
  expect(new Set(violinSetlists.map((item) => item.id)).size).toBe(10)
  for (const item of violinSetlists) {
    expect(item.titles.length).toBeGreaterThanOrEqual(8)
    expect(new Set(item.titles).size).toBe(item.titles.length)
  }
  const available = resolveViolinSetlists([
    { title: 'Perfect', instrument: 'cello' },
    { title: 'All of Me', artist: 'John Legend', instrument: 'violin' },
    { title: 'A Thousand Years', instrument: 'violin' },
  ])
  expect(
    available.find((item) => item.id === 'cerimonia-romantica')?.songs.map((song) => song.title),
  ).toEqual(['A Thousand Years', 'All of Me'])
  expect(resolveViolinSetlists([{ title: 'Perfect', instrument: 'cello' }])).toEqual([])
})

it('mantém músicas de mesmo título separadas e escolhe o artista correto no setlist', () => {
  const john = { title: 'All of Me', artist: 'John Legend', instrument: 'violin' }
  const elvis = { title: 'All of Me', artist: 'Elvis Presley', instrument: 'violin' }
  for (const songs of [
    [john, elvis],
    [elvis, john],
  ]) {
    expect(
      resolveViolinSetlists(songs).find((setlist) => setlist.id === 'cerimonia-romantica')?.songs,
    ).toEqual([john])
  }
  expect(resolveViolinSetlists([elvis])).toEqual([])
})

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
it('resolve 10 seleções no básico e 42 sequências distintas de oito músicas no completo', () => {
  const songs = publicRepertoire.map(([title, artist]) => ({ title, artist, instrument: 'violin' }))
  expect(resolveSetlists(songs, 10)).toHaveLength(10)
  const complete = resolveSetlists(songs, 42)
  expect(complete).toHaveLength(42)
  expect(new Set(complete.map((setlist) => setlist.id)).size).toBe(42)
  expect(
    new Set(
      complete.map((setlist) =>
        setlist.songs.map((song) => `${song.title}:${song.artist}`).join('|'),
      ),
    ).size,
  ).toBe(42)
  for (const setlist of complete) {
    expect(setlist.songs.length).toBe(setlist.titles.length)
    expect(setlist.songs.length).toBeGreaterThanOrEqual(8)
    expect(new Set(setlist.songs.map((song) => `${song.title}:${song.artist}`)).size).toBe(
      setlist.songs.length,
    )
  }
})
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

it('preserva o áudio e a partitura ao renovar o token e usa a nova credencial na próxima solicitação', async () => {
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
  const requests = fetchMock.mock.calls.length
  mounted.rerender(<MemberRepertoire data={data} token="renewed-test-token" />)
  expect(screen.getByRole('img', { name: 'Fix You - imagem' })).toBe(image)
  expect(document.querySelector('audio')).toBe(audio)
  expect(audio.currentTime).toBe(40)
  expect(screen.queryByRole('combobox', { name: 'Zoom da partitura' })).not.toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledTimes(requests)
  fireEvent.error(image)
  await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
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
  const audio = document.querySelector('audio')!
  audio.currentTime = 42
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/score-png/view'),
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } }),
  )
  expect(screen.queryByRole('combobox', { name: 'Zoom da partitura' })).not.toBeInTheDocument()
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Escolher partitura' }),
    'score-pdf',
  )
  expect(await screen.findByTitle('Fix You - PDF')).toHaveAttribute(
    'data-url',
    'https://storage.example.test/score.pdf',
  )
  expect(document.querySelector('audio')).toBe(audio)
  expect(audio.currentTime).toBe(42)
  const calls = fetchMock.mock.calls.length
  fireEvent.error(audio)
  await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
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

it('mantém apenas busca e estilo e oculta todo áudio no plano básico', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  render(<MemberRepertoire data={{ ...data, setlistLimit: 10 }} token="test-token" />)
  const user = userEvent.setup()
  expect(screen.queryByRole('combobox', { name: 'Ordenar por' })).not.toBeInTheDocument()
  expect(screen.queryByRole('combobox', { name: 'Playback' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Abrir áudio/ })).not.toBeInTheDocument()
  await user.selectOptions(screen.getByRole('combobox', { name: 'Estilo' }), 'Pop internacional')
  expect(screen.getAllByRole('row')).toHaveLength(2)
  expect(screen.getByRole('row', { name: /Fix You/ })).toBeInTheDocument()
  await user.type(screen.getByRole('searchbox'), 'inexistente')
  expect(screen.getByText('Nenhuma música encontrada.')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
  expect(screen.getAllByRole('row')).toHaveLength(3)
  expect(fetchMock).not.toHaveBeenCalled()
})

it('abre os materiais em modal, bloqueia a rolagem do fundo e restaura o foco ao fechar com Escape', async () => {
  const fetchMock = vi.fn(
    async () => new Response(JSON.stringify({ url: 'https://storage.example.test/score.png' })),
  )
  vi.stubGlobal('fetch', fetchMock)
  render(<MemberRepertoire data={{ ...data, assets: [data.assets[0]] }} token="test-token" />)
  const user = userEvent.setup()
  const trigger = screen.getByRole('button', { name: 'Ver partitura de Fix You' })
  await user.click(trigger)
  await screen.findByRole('img', { name: 'Fix You - imagem' })
  const dialog = screen.getByRole('dialog', { name: 'Materiais de Fix You' })
  expect(dialog).toHaveAttribute('open')
  expect(document.body.style.overflow).toBe('hidden')
  expect(screen.getByRole('heading', { name: 'Fix You' })).toHaveFocus()
  fireEvent(dialog, new Event('cancel', { cancelable: true }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(document.body.style.overflow).not.toBe('hidden')
  expect(trigger).toHaveFocus()
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

it('mantém a ordem do setlist e abre cada partitura no modal sem lista de músicas', async () => {
  const fetchMock = vi.fn(
    async () => new Response(JSON.stringify({ url: 'https://storage.example.test/score.png' })),
  )
  vi.stubGlobal('fetch', fetchMock)
  const titles = ['Perfect', "Can't Help Falling in Love", 'A Thousand Years']
  const collection: MemberLibraryData = {
    ...data,
    assets: titles.map((songTitle, index) => ({
      ...data.assets[0],
      id: `setlist-score-${index}`,
      title: songTitle,
      songTitle,
    })),
  }
  render(<MemberRepertoire data={collection} token="test-token" />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /Setlists prontos/ }))
  await user.click(screen.getByRole('button', { name: 'Abrir setlist Cerimônia romântica' }))
  expect(screen.getByRole('heading', { name: 'Cerimônia romântica' })).toHaveFocus()
  expect(screen.queryByRole('combobox', { name: 'Ordenar por' })).not.toBeInTheDocument()
  expect(
    screen
      .getAllByRole('row')
      .slice(1)
      .map((row) => within(row).getByRole('button', { name: /Abrir materiais/ }).textContent),
  ).toEqual([
    expect.stringContaining('A Thousand Years'),
    expect.stringContaining("Can't Help Falling in Love"),
    expect.stringContaining('Perfect'),
  ])
  expect(fetchMock).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Ver partitura de A Thousand Years' }))
  await screen.findByRole('img', { name: 'A Thousand Years' })
  expect(screen.queryByRole('navigation', { name: 'Navegar pelo setlist' })).not.toBeInTheDocument()
  expect(screen.queryByRole('combobox', { name: /Lista de músicas/ })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Fechar materiais' }))
  await user.click(
    screen.getByRole('button', { name: "Ver partitura de Can't Help Falling in Love" }),
  )
  await screen.findByRole('img', { name: "Can't Help Falling in Love" })
  await user.click(screen.getByRole('button', { name: 'Fechar materiais' }))
  await user.click(screen.getByRole('button', { name: 'Ver partitura de Perfect' }))
  await screen.findByRole('img', { name: 'Perfect' })
  await user.click(screen.getByRole('button', { name: 'Fechar materiais' }))
  await user.click(screen.getByRole('button', { name: 'Voltar aos setlists' }))
  expect(screen.queryByRole('img', { name: 'Perfect' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /^Partituras \d/ }))
  expect(screen.getByRole('heading', { name: 'Seu repertório' })).toBeInTheDocument()
})

it('exibe apenas o material e o player, inicia o áudio e o pausa ao fechar', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async (input: string) =>
        new Response(
          JSON.stringify({
            url: `https://storage.example.test/${input.includes('next-audio') ? 'next' : 'track'}.mp3`,
          }),
        ),
    ),
  )
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause')
  const assets = [
    data.assets[2],
    { ...data.assets[2], id: 'next-audio', title: 'Yellow - acompanhamento', songTitle: 'Yellow' },
  ]
  render(<MemberRepertoire data={{ ...data, assets }} token="test-token" />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Abrir áudio de Fix You' }))
  await waitFor(() =>
    expect(document.querySelector('audio')).toHaveAttribute(
      'src',
      'https://storage.example.test/track.mp3',
    ),
  )
  expect(play).toHaveBeenCalled()
  const audio = document.querySelector('audio')!
  const dialog = screen.getByRole('dialog', { name: 'Materiais de Fix You' })
  expect(
    within(dialog).queryByRole('combobox', { name: /Lista de músicas/ }),
  ).not.toBeInTheDocument()
  expect(within(dialog).queryByText('ÁREA DE ESTUDO')).not.toBeInTheDocument()
  expect(
    within(dialog).queryByRole('button', { name: 'Renovar acesso ao arquivo' }),
  ).not.toBeInTheDocument()
  expect(within(dialog).getByLabelText('Áudio da partitura')).toContainElement(audio)
  fireEvent.ended(audio)
  expect(screen.getByRole('dialog', { name: 'Materiais de Fix You' })).toBe(dialog)
  await user.click(screen.getByRole('button', { name: 'Fechar materiais' }))
  expect(pause.mock.instances).toContain(audio)
  expect(document.querySelector('audio')).not.toBeInTheDocument()
  play.mockRestore()
  pause.mockRestore()
})
