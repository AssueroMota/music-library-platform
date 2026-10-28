import { auth } from './auth'
import { redeemPersonalAccess, trustedLoginUrl, type PersonalAccess } from './library-access'

// Deduplicate the whole login, including OTP consumption, across StrictMode effects.
const pending = new Map<string, Promise<void>>()
export function openPersonalLibrary(access: Exclude<PersonalAccess, 'invalid' | null>) {
  const key = JSON.stringify(access)
  const existing = pending.get(key)
  if (existing) return existing
  const result = (async () => {
    if (!auth) throw new Error('O acesso está temporariamente indisponível. Tente novamente.')
    const { data: current } = await auth.auth.getSession()
    const response = await redeemPersonalAccess(access, current.session?.access_token)
    // The API validates both the personal secret and the current account before reuse.
    if ('authenticated' in response) return
    const login = new URL(trustedLoginUrl(response.url))
    const token = login.searchParams.get('token')
    const type = login.searchParams.get('type')
    if (!token || !['magiclink', 'signup', 'email'].includes(type ?? ''))
      throw new Error('Não foi possível abrir seu acesso. Tente novamente.')
    const { data, error } = await auth.auth.verifyOtp({
      token_hash: token,
      type: type as 'magiclink' | 'signup' | 'email',
    })
    if (error || !data.session)
      throw new Error('Não foi possível confirmar seu acesso. Tente novamente.')
  })().finally(() => pending.delete(key))
  pending.set(key, result)
  return result
}
