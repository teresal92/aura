import type { Tables } from '@/types/database'
import type { Task } from '@/types/task'

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
