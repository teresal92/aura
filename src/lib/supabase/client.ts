import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

type GetToken = () => Promise<string | null>

// Client Components. Pass `getToken` from Clerk's `useAuth()`.
export function createClient(getToken: GetToken) {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { accessToken: getToken }
  )
}
