import type { Priority, Task } from '@/types/task'
import { isCompleted } from '@/lib/tasks/mappers'

const priorityOrder: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

// Open tasks first, then by priority. Order within a priority group isn't guaranteed.
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (isCompleted(a) !== isCompleted(b)) return isCompleted(a) ? 1 : -1
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}
