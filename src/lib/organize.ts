import type { Task } from '@/types/task'

export type Horizon = 'today' | 'week' | 'later'

export interface OrganizedTasks {
  today: Task[]
  week: Task[]
  later: Task[]
  // Loose ends the LLM couldn't place; they stay out of the dated sections until resolved.
  unsure: Task[]
}

const DAY_MS = 1000 * 60 * 60 * 24

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// Dated tasks bucket by due date (local day boundaries); undated tasks fall back to priority.
export function getHorizon(task: Task, now: Date = new Date()): Horizon {
  if (task.dueDate) {
    const days = Math.round(
      (startOfDay(new Date(task.dueDate)).getTime() - startOfDay(now).getTime()) / DAY_MS
    )
    if (days <= 0) return 'today'
    if (days <= 7) return 'week'
    return 'later'
  }

  if (task.priority === 'urgent' || task.priority === 'high') return 'today'
  if (task.priority === 'medium') return 'week'
  return 'later'
}

export function organizeTasks(tasks: Task[], now: Date = new Date()): OrganizedTasks {
  const organized: OrganizedTasks = { today: [], week: [], later: [], unsure: [] }
  for (const task of tasks) {
    if (task.ambiguous && !task.completed) organized.unsure.push(task)
    else organized[getHorizon(task, now)].push(task)
  }
  return organized
}

// Follow-up questions: loose ends are asked first, optional ones only after "Ask me more".
export function getClarificationQueue(tasks: Task[]) {
  const open = tasks.filter((task) => !task.completed && task.clarification)
  return {
    required: open.filter((task) => task.ambiguous),
    optional: open.filter((task) => !task.ambiguous),
  }
}
