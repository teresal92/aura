import 'server-only'

import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

// Bypasses RLS, so scope every query yourself. Only for code with no user session (webhooks).
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
