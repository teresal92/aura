import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Hard-deletes every task owned by a Clerk user, bypassing RLS. Only for cleanup after the user's
 * account is gone (the Clerk webhook); signed-in requests go through the task repository.
 * Idempotent: deleting for a user with no tasks succeeds.
 */
export async function deleteUserTasks(userId: string): Promise<void> {
  if (!userId) throw new Error('deleteUserTasks needs a user ID')

  const { error } = await createAdminClient().from('tasks').delete().eq('user_id', userId)
  if (error)
    throw new Error(`Failed to delete tasks for ${userId}: ${error.message}`, { cause: error })
}
