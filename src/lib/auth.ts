import { createClient } from '@supabase/supabase-js'

// Only the publishable/anon key belongs in the browser. Service-role stays in server/providers.
export const auth =
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
    : null
