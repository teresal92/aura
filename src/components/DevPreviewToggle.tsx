'use client'

import { useEffect } from 'react'
import {
  createPreviewTasks,
  isPreviewTask,
  setPreviewTasksEnabled,
  usePreviewTasksEnabled,
} from '@/lib/preview-tasks'
import { sortTasks, useTaskStore } from '@/store/tasks'

// Development-only switch that adds or removes placeholder tasks. Renders nothing in production.
export function DevPreviewToggle() {
  const enabled = usePreviewTasksEnabled()

  useEffect(() => {
    useTaskStore.setState((state) => {
      const realTasks = state.tasks.filter((task) => !isPreviewTask(task))
      return { tasks: enabled ? sortTasks([...realTasks, ...createPreviewTasks()]) : realTasks }
    })
  }, [enabled])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => setPreviewTasksEnabled(!enabled)}
      className="fixed right-4 bottom-4 z-40 bg-background text-sm hover:bg-foreground"
    >
      Preview tasks: {enabled ? 'on' : 'off'}
    </button>
  )
}
