import 'server-only'

import type { PostgrestError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { toTask, toTaskInsert, toTaskUpdate } from '@/lib/tasks'
import type { NewTask, Task, TaskPatch } from '@/types/task'

// The only module that talks to the database for tasks. Every query runs as the signed-in user,
// so RLS limits it to their own rows. Callers get Tasks, never Supabase's { data, error } shape.

function databaseError(action: string, error: PostgrestError): Error {
  return new Error(`Failed to ${action}: ${error.message}`, { cause: error })
}

/** The user's tasks, in no guaranteed order; the client sorts them. */
export async function listTasks(): Promise<Task[]> {
  const { data, error } = await createClient().from('tasks').select()
  if (error) throw databaseError('list tasks', error)
  return data.map(toTask)
}

/** Saves the tasks in one insert, so either all are saved or none are. */
export async function createTasks(tasks: NewTask[]): Promise<Task[]> {
  if (tasks.length === 0) return []

  const { data, error } = await createClient()
    .from('tasks')
    .insert(tasks.map(toTaskInsert))
    .select()
  if (error) throw databaseError('create tasks', error)
  return data.map(toTask)
}

/** Returns null when the task doesn't exist or belongs to another user. */
export async function updateTask(id: string, patch: TaskPatch): Promise<Task | null> {
  const columns = toTaskUpdate(patch, new Date())
  const tasks = createClient().from('tasks')

  // An empty update is rejected by PostgREST; return the task as it is.
  const query =
    Object.keys(columns).length === 0
      ? tasks.select().eq('id', id)
      : tasks.update(columns).eq('id', id).select()

  const { data, error } = await query.maybeSingle()
  if (error) throw databaseError('update task', error)
  return data ? toTask(data) : null
}

/** Hard delete. Returns false when the task doesn't exist or belongs to another user. */
export async function deleteTask(id: string): Promise<boolean> {
  const { data, error } = await createClient().from('tasks').delete().eq('id', id).select('id')
  if (error) throw databaseError('delete task', error)
  return data.length > 0
}
