import { auth } from '@clerk/nextjs/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

// Server Components, Server Actions, and Route Handlers. Clerk owns the session;
// Supabase verifies the Clerk token via its third-party auth integration.
export function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken()
      },
    }
  )
}
