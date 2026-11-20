import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

/** Deletes all of a user's tasks once their Clerk account is gone. Bypasses RLS; idempotent. */
export async function deleteUserTasks(userId: string): Promise<void> {
  if (!userId) throw new Error('deleteUserTasks needs a user ID')

  const { error } = await createAdminClient().from('tasks').delete().eq('user_id', userId)
  if (error)
    throw new Error(`Failed to delete tasks for ${userId}: ${error.message}`, { cause: error })
}
