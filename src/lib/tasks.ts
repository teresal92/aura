import type { Task } from '@/types/task'

// Completion is stored only as completedAt; derive the boolean so the two can never disagree.
// Loose check: a completedAt missing from untyped data (e.g. JSON) reads as not completed.
export function isCompleted(task: Pick<Task, 'completedAt'>): boolean {
  return task.completedAt != null
}
