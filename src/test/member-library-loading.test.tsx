import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MemberLibrary } from '../components/MemberLibrary'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { publicRepertoire } from '../data/public-repertoire'

const { getSession, signOut, authListener } = vi.hoisted(() => ({
  getSession: vi.fn(),
  signOut: vi.fn(async () => {}),
  authListener: {
    callback: null as ((event: AuthChangeEvent, session: Session | null) => void) | null,
  },
}))
vi.mock('../lib/auth', () => ({
  auth: {
    auth: {
      getSession,
      signOut,
      onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
        authListener.callback = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      },
    },
  },
}))

beforeEach(() => {
  authListener.callback = null
  window.history.replaceState({}, '', '/biblioteca')
  getSession.mockResolvedValue({
    data: { session: { access_token: 'test-session-only', user: { id: 'test-user' } } },
    error: null,
  })
  vi.useFakeTimers()
  vi.spyOn(AbortSignal, 'timeout').mockImplementation((milliseconds) => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(new DOMException('Timed out', 'TimeoutError')), milliseconds)
    return controller.signal
  })
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

function delayedLibrary() {
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
    signal: () => signal,
    finish: () => finish(new Response(JSON.stringify({ products: [], assets: [] }))),
  }
}

it('aguarda a inicialização por mais de 15 segundos e carrega sem pedir novo login', async () => {
  const request = delayedLibrary()
  render(<MemberLibrary />)
  await act(async () => {})
  expect(request.fetchMock).toHaveBeenCalledTimes(1)
  await act(async () => {
    await vi.advanceTimersByTimeAsync(65000)
  })
  expect(request.signal()?.aborted).toBe(false)
  expect(screen.getByRole('status')).toHaveTextContent('Estamos preparando seus materiais')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  await act(async () => {
    request.finish()
  })
  expect(screen.getByRole('heading', { name: 'Seu repertório' })).toBeInTheDocument()
  expect(signOut).not.toHaveBeenCalled()
  expect(request.fetchMock).toHaveBeenCalledTimes(1)
})

it('encerra a espera com opção de tentar novamente e preserva a sessão', async () => {
  const request = delayedLibrary()
  render(<MemberLibrary />)
  await act(async () => {})
  await act(async () => {
    await vi.advanceTimersByTimeAsync(90001)
  })
  expect(screen.getByRole('alert')).toHaveTextContent('O serviço demorou para responder')
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  })
  expect(request.fetchMock).toHaveBeenCalledTimes(2)
  await act(async () => {
    request.finish()
  })
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Seu repertório' })).toBeInTheDocument()
  expect(signOut).not.toHaveBeenCalled()
})

it('cancela a consulta ao sair da página sem renderizar uma resposta antiga', async () => {
  const request = delayedLibrary()
  const mounted = render(<MemberLibrary />)
  await act(async () => {})
  mounted.unmount()
  expect(request.signal()?.aborted).toBe(true)
  await act(async () => {
    await vi.advanceTimersByTimeAsync(90001)
  })
  expect(request.fetchMock).toHaveBeenCalledTimes(1)
})

it('mantém a busca e a biblioteca ao retornar à aba e renovar o token da mesma conta', async () => {
  const request = delayedLibrary()
  render(<MemberLibrary />)
  await act(async () => {})
  await act(async () => {
    request.finish()
  })
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Coldplay' } })
  await act(async () => {
    authListener.callback?.('SIGNED_IN', {
      access_token: 'test-session-only',
      user: { id: 'test-user' },
    } as Session)
    authListener.callback?.('TOKEN_REFRESHED', {
      access_token: 'new-test-token',
      user: { id: 'test-user' },
    } as Session)
  })
  expect(request.fetchMock).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('searchbox')).toHaveValue('Coldplay')
  expect(screen.getByRole('heading', { name: 'Seu repertório' })).toBeInTheDocument()
  expect(screen.queryByText('Carregando seus materiais…')).not.toBeInTheDocument()
})

it('remove os materiais ao sair e consulta novamente ao trocar de conta', async () => {
  const request = delayedLibrary()
  render(<MemberLibrary />)
  await act(async () => {})
  await act(async () => {
    request.finish()
  })
  await act(async () => {
    authListener.callback?.('SIGNED_OUT', null)
  })
  expect(screen.queryByRole('heading', { name: 'Seu repertório' })).not.toBeInTheDocument()
  expect(screen.getByLabelText('Seu e-mail')).toBeInTheDocument()
  await act(async () => {
    authListener.callback?.('SIGNED_IN', {
      access_token: 'other-test-token',
      user: { id: 'other-user' },
    } as Session)
  })
  expect(request.fetchMock).toHaveBeenCalledTimes(2)
  expect(request.fetchMock.mock.calls[1][1].headers).toEqual({
    Authorization: 'Bearer other-test-token',
  })
})

it('mostra a prévia básica para o titular completo sem alterar os materiais da conta', async () => {
  const assets = publicRepertoire.flatMap(([songTitle, artist, style], index) =>
    ['score', 'audio'].map((kind) => ({
      id: `${kind}-${index}`,
      title: songTitle,
      songTitle,
      artist,
      style,
      instrument: 'violin',
      kind,
      format: kind === 'score' ? 'pdf' : 'mp3',
    })),
  )
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ setlistLimit: 42, products: [], assets }))),
  )
  window.history.replaceState({}, '', '/biblioteca?visualizar=basico')
  const mounted = render(<MemberLibrary />)
  await act(async () => {})
  expect(screen.getByRole('button', { name: /Fazer upgrade · R\$\s0,00/ })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Abrir áudio/ })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /Setlists prontos/ }))
  expect(screen.getAllByRole('button', { name: /Abrir setlist/ })).toHaveLength(10)
  mounted.unmount()
  window.history.replaceState({}, '', '/biblioteca')
  render(<MemberLibrary />)
  await act(async () => {})
  expect(screen.getAllByRole('button', { name: /Abrir áudio/ })).toHaveLength(103)
  fireEvent.click(screen.getByRole('button', { name: /Setlists prontos/ }))
  expect(screen.getAllByRole('button', { name: /Abrir setlist/ })).toHaveLength(42)
})

it('exibe no botão a diferença calculada pela API para a conta autenticada', async () => {
  const fetchMock = vi.fn(
    async (url: string, _init?: RequestInit) =>
      new Response(
        JSON.stringify(
          url.endsWith('/library/upgrade')
            ? {
                alreadyComplete: false,
                priceCents: 4870,
                creditCents: 120,
                completePriceCents: 4990,
                email: 'buyer@example.test',
                available: true,
                checkoutEnabled: true,
                pendingCheckoutUrl: null,
              }
            : {
                setlistLimit: 10,
                products: [],
                assets: [
                  {
                    id: 'one-score',
                    title: 'Fix You',
                    songTitle: 'Fix You',
                    artist: 'Coldplay',
                    style: 'Pop',
                    instrument: 'violin',
                    kind: 'score',
                    format: 'pdf',
                  },
                ],
              },
        ),
      ),
  )
  vi.stubGlobal('fetch', fetchMock)
  render(<MemberLibrary />)
  await act(async () => {})
  expect(screen.getByRole('button', { name: /Fazer upgrade · R\$\s48,70/ })).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/library/upgrade'),
    expect.objectContaining({ headers: { Authorization: 'Bearer test-session-only' } }),
  )
  expect(fetchMock.mock.calls.every(([, init]) => !init || !(init as RequestInit).method)).toBe(
    true,
  )
})
