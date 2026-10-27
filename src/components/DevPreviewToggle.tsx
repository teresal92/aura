'use client'

import { setPreviewTasksEnabled, usePreviewTasksEnabled } from '@/lib/tasks/preview'

// Development-only switch that shows or hides placeholder tasks. Renders nothing in production.
export function DevPreviewToggle() {
  const enabled = usePreviewTasksEnabled()

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
