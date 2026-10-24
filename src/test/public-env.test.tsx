import { render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { publicEnv } from '../lib/public-env'
import { PageErrorBoundary } from '../components/PageErrorBoundary'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.resetModules()
  localStorage.clear()
})

it('remove apenas aspas externas correspondentes e espaços de valores públicos', () => {
  expect(publicEnv(' "https://project.supabase.co" ')).toBe('https://project.supabase.co')
  expect(publicEnv("'sb_publishable_test-only'")).toBe('sb_publishable_test-only')
  expect(publicEnv('https://project.supabase.co')).toBe('https://project.supabase.co')
  expect(publicEnv('"https://project.supabase.co')).toBe('"https://project.supabase.co')
  expect(publicEnv(undefined)).toBe('')
})

it('inicializa o SDK real com a URL e a chave copiadas com aspas', async () => {
  vi.resetModules()
  vi.stubEnv('VITE_SUPABASE_URL', '"https://project.supabase.co"')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', '"sb_publishable_test-only"')
  const { auth } = await import('../lib/auth')
  expect(auth).not.toBeNull()
  expect((await auth!.auth.getSession()).data.session).toBeNull()
  auth!.auth.stopAutoRefresh()
})

it.each(['invalid-url', '"https://project.supabase.co', 'ftp://project.supabase.co', ''])(
  'não derruba a página com configuração inválida: %s',
  async (value) => {
    vi.resetModules()
    vi.stubEnv('VITE_SUPABASE_URL', value)
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_test-only')
    const { auth } = await import('../lib/auth')
    expect(auth).toBeNull()
  },
)

it('consulta a API com a URL normalizada', async () => {
  vi.resetModules()
  vi.stubEnv('VITE_API_URL', ' "https://api.example.test/" ')
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true })))
  vi.stubGlobal('fetch', fetchMock)
  const { api } = await import('../lib/api')
  await api('/health')
  expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/api/health', expect.anything())
})

it('oferece recuperação em vez de tela vazia se um componente falhar', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const Broken = (): never => {
    throw new Error('render failure')
  }
  render(
    <PageErrorBoundary>
      <Broken />
    </PageErrorBoundary>,
  )
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar esta página.')
  expect(screen.getByRole('button', { name: 'Recarregar página' })).toBeInTheDocument()
})
