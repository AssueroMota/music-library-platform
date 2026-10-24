import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { readPersonalAccess, redeemPersonalAccess, trustedLoginUrl } from '../lib/library-access'
import { PersonalLibraryAccess } from '../components/PersonalLibraryAccess'

const id = '11111111-1111-4111-8111-111111111111',
  token = 'a'.repeat(64)
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

it('lê o segredo somente do fragmento e recusa IDs isolados e links incompletos', () => {
  expect(readPersonalAccess(`#id=${id}&acesso=${token}`)).toEqual({ id, token })
  expect(readPersonalAccess(`#id=${id}`)).toBe('invalid')
  expect(readPersonalAccess(`#id=${id}&acesso=guess`)).toBe('invalid')
  expect(readPersonalAccess('#access_token=temporary-session')).toBeNull()
  expect(readPersonalAccess('')).toBeNull()
})

it('deduplica a troca concorrente e envia o segredo no corpo, sem incluí-lo na URL', async () => {
  let resolve: (response: Response) => void = () => {}
  const fetchMock = vi.fn(
    () =>
      new Promise<Response>((done) => {
        resolve = done
      }),
  )
  vi.stubGlobal('fetch', fetchMock)
  const first = redeemPersonalAccess({ id, token }),
    second = redeemPersonalAccess({ id, token })
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const [url, init] = vi.mocked(fetch).mock.calls[0]
  expect(String(url)).toMatch(/\/api\/auth\/access$/)
  expect(String(url)).not.toContain(token)
  expect(JSON.parse(init?.body as string)).toEqual({ id, token })
  resolve(
    new Response(
      JSON.stringify({ url: 'https://project.supabase.co/auth/v1/verify?token=temporary' }),
    ),
  )
  expect(await first).toEqual(await second)
})

it('recusa redirecionamento para outro site ou outra rota', () => {
  vi.stubEnv('VITE_SUPABASE_URL', '"https://project.supabase.co"')
  expect(trustedLoginUrl('https://project.supabase.co/auth/v1/verify?token=temporary')).toContain(
    '/auth/v1/verify',
  )
  expect(() => trustedLoginUrl('https://evil.example/auth/v1/verify')).toThrow()
  expect(() => trustedLoginUrl('https://project.supabase.co/another-page')).toThrow()
})

it('oferece nova tentativa quando o link foi recusado ou a API está indisponível', async () => {
  const fetchMock = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          code: 'ACCESS_LINK_UNAVAILABLE',
          message: 'Este link não está disponível.',
        }),
        { status: 403 },
      ),
  )
  vi.stubGlobal('fetch', fetchMock)
  render(<PersonalLibraryAccess access={{ id, token }} />)
  expect(await screen.findByRole('alert')).toHaveTextContent('Este link não está disponível.')
  await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  expect(await screen.findByRole('alert')).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(screen.getByRole('link', { name: 'Solicitar meu link por e-mail' })).toHaveAttribute(
    'href',
    '/biblioteca',
  )
})
