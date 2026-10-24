import { api } from './api'
import { publicEnv } from './public-env'

export type PersonalAccess = { id: string; token: string } | 'invalid' | null

export function readPersonalAccess(hash: string): PersonalAccess {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  if (!params.has('id') && !params.has('acesso')) return null
  const id = params.get('id') ?? '',
    token = params.get('acesso') ?? ''
  return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id) &&
    /^[a-f0-9]{64}$/.test(token)
    ? { id, token }
    : 'invalid'
}

const pending = new Map<string, Promise<{ url: string }>>()
export function redeemPersonalAccess(access: Exclude<PersonalAccess, 'invalid' | null>) {
  const key = JSON.stringify(access)
  const existing = pending.get(key)
  if (existing) return existing
  const result = api<{ url: string }>(
    '/auth/access',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(access),
    },
    60000,
  ).finally(() => pending.delete(key))
  pending.set(key, result)
  return result
}

export function trustedLoginUrl(value: string) {
  const url = new URL(value)
  const expected = new URL(publicEnv(import.meta.env.VITE_SUPABASE_URL))
  if (
    url.origin !== expected.origin ||
    url.pathname !== '/auth/v1/verify' ||
    url.username ||
    url.password
  )
    throw new Error('Não foi possível abrir seu acesso. Tente novamente.')
  return url.href
}
