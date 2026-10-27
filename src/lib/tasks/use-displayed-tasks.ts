'use client'

import { useTasks } from '@/lib/query/tasks'
import type { Task } from '@/types/task'

const NO_TASKS: Task[] = []

/** The signed-in user's saved tasks, sorted; none while signed out or loading. */
export function useDisplayedTasks(): Task[] {
  const { data: savedTasks = NO_TASKS } = useTasks()
  return savedTasks
}
