import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'
import type { NewTask, Task, TaskPatch } from '@/types/task'

// Completion is stored only as completedAt; derive the boolean so the two can never disagree.
// Loose check: a completedAt missing from untyped data (e.g. JSON) reads as not completed.
export function isCompleted(task: Pick<Task, 'completedAt'>): boolean {
  return task.completedAt != null
}

// PostgREST returns timestamptz as e.g. "2026-10-20T01:41:07.123456+00:00"; Task wants "...Z".
// Safe for instants only. Calendar dates must never go through new Date.
function toIsoTimestamp(value: string): string {
  return new Date(value).toISOString()
}

// Drops the internal columns (user_id, seq). dueDate stays "YYYY-MM-DD".
export function toTask(row: Tables<'tasks'>): Task {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority,
    estimatedDuration: row.estimated_duration,
    dueDate: row.due_date,
    category: row.category,
    subtasks: row.subtasks,
    notes: row.notes,
    completedAt: row.completed_at == null ? null : toIsoTimestamp(row.completed_at),
    createdAt: toIsoTimestamp(row.created_at),
  }
}

export function toTaskInsert(task: NewTask): TablesInsert<'tasks'> {
  return {
    title: task.title,
    priority: task.priority,
    estimated_duration: task.estimatedDuration,
    due_date: task.dueDate,
    category: task.category,
    subtasks: task.subtasks,
    notes: task.notes,
  }
}

// Only the fields present in the patch. `now` is the server's clock: the client never sends
// a completion time.
export function toTaskUpdate(patch: TaskPatch, now: Date): TablesUpdate<'tasks'> {
  const columns: TablesUpdate<'tasks'> = {}
  if (patch.title !== undefined) columns.title = patch.title
  if (patch.priority !== undefined) columns.priority = patch.priority
  if (patch.estimatedDuration !== undefined) columns.estimated_duration = patch.estimatedDuration
  if (patch.dueDate !== undefined) columns.due_date = patch.dueDate
  if (patch.category !== undefined) columns.category = patch.category
  if (patch.subtasks !== undefined) columns.subtasks = patch.subtasks
  if (patch.notes !== undefined) columns.notes = patch.notes
  if (patch.completed !== undefined)
    columns.completed_at = patch.completed ? now.toISOString() : null
  return columns
}
