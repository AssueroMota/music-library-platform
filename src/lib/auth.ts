import { createClient } from '@supabase/supabase-js'
import { publicEnv } from './public-env'

// Only the publishable/anon key belongs in the browser. Service-role stays in server/providers.
function browserAuth() {
  const url = publicEnv(import.meta.env.VITE_SUPABASE_URL)
  const key = publicEnv(import.meta.env.VITE_SUPABASE_ANON_KEY)
  if (!url || !key) return null
  try {
    if (!['http:', 'https:'].includes(new URL(url).protocol)) return null
    return createClient(url, key)
  } catch {
    // Invalid configuration must leave the entry page visible, never crash its import.
    return null
  }
}

export const auth = browserAuth()
