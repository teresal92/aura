import 'server-only'

import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

// Privileged access for code that runs without a user session (e.g. Clerk webhooks). The secret
// key bypasses RLS, so every query here must scope itself. Never use this on a user's behalf; the
// task repository's per-user client is for that.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!url || !secretKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set')
  }

  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
