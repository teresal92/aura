'use client'

import { useMemo } from 'react'
import { useTasks } from '@/lib/query/tasks'
import { usePreviewTasks } from '@/lib/tasks/preview'
import { sortTasks } from '@/lib/tasks/sort'
import type { Task } from '@/types/task'

const NO_TASKS: Task[] = []

/** The signed-in user's saved tasks, with any dev preview tasks mixed in, sorted. */
export function useDisplayedTasks(): Task[] {
  const { data: savedTasks = NO_TASKS } = useTasks()
  const previewTasks = usePreviewTasks()

  return useMemo(
    () => (previewTasks.length === 0 ? savedTasks : sortTasks([...savedTasks, ...previewTasks])),
    [savedTasks, previewTasks]
  )
}
