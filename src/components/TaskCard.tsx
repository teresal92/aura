'use client'

import type { Task } from '@/types/task'
import { useTaskStore } from '@/store/tasks'
import {
  CategoryBadge,
  MetaText,
  PriorityBadge,
  CompletionCheckbox,
} from '@/components/aura-primitives'
import { cn } from '@/lib/utils'

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days <= 7) return `In ${days} days`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TaskCard({ task }: { task: Task }) {
  const { completeTask, uncompleteTask } = useTaskStore()

  function handleComplete() {
    if (task.completed) {
      uncompleteTask(task.id)
    } else {
      completeTask(task.id)
    }
  }

  const hasDetails = task.subtasks.length > 0 || task.notes

  return (
    <div className={cn('aura-card p-4', task.completed && 'opacity-60')} role="article">
      <div className="flex items-start gap-3">
        <CompletionCheckbox checked={task.completed} onChange={handleComplete} className="mt-0.5" />

        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'text-sm font-medium leading-snug text-foreground',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <MetaText>{formatDuration(task.estimatedDuration)}</MetaText>
            <CategoryBadge category={task.category} />
            {task.dueDate ? (
              <span className="text-xs font-medium text-primary">
                {formatDueDate(task.dueDate)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {hasDetails ? (
        <div className="mt-3 ml-9 space-y-2">
          {task.subtasks.length > 0 ? (
            <ul className="space-y-1.5 text-sm text-muted-foreground" role="list">
              {task.subtasks.map((subtask, index) => (
                <li key={index}>
                  {index + 1}. {subtask}
                </li>
              ))}
            </ul>
          ) : null}
          {task.notes ? (
            <p className="text-xs text-muted-foreground/80 leading-relaxed italic">{task.notes}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
