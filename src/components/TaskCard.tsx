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
import { formatDueDate } from '@/lib/dates'
import { isCompleted } from '@/lib/tasks/mappers'

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
}

export function TaskCard({ task }: { task: Task }) {
  const { completeTask, uncompleteTask } = useTaskStore()
  const completed = isCompleted(task)

  function handleComplete() {
    if (completed) {
      uncompleteTask(task.id)
    } else {
      completeTask(task.id)
    }
  }

  const hasDetails = task.subtasks.length > 0 || task.notes

  return (
    <div
      className={cn(
        'border border-border p-6 transition-opacity duration-250',
        completed && 'opacity-50'
      )}
      role="article"
    >
      <div className="flex items-start gap-4">
        <CompletionCheckbox checked={completed} onChange={handleComplete} className="mt-0.5" />

        <div className="min-w-0 flex-1">
          <h3 className={cn(completed && 'line-through text-muted-foreground')}>{task.title}</h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <PriorityBadge priority={task.priority} />
            <MetaText>{formatDuration(task.estimatedDuration)}</MetaText>
            <CategoryBadge category={task.category} />
            {task.dueDate ? (
              <span className="text-base italic text-muted-foreground">
                {formatDueDate(task.dueDate)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {hasDetails ? (
        <div className="mt-4 ml-10 space-y-2">
          {task.subtasks.length > 0 ? (
            <ul className="space-y-1 text-lg leading-relaxed text-foreground" role="list">
              {task.subtasks.map((subtask, index) => (
                <li key={index}>
                  {index + 1}. {subtask}
                </li>
              ))}
            </ul>
          ) : null}
          {task.notes ? (
            <p className="text-base italic leading-relaxed text-muted-foreground">{task.notes}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
