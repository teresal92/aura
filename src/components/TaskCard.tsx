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

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
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
    <div
      className={cn(
        'aura-card rounded-[1.6rem] border-aura-divider/80 bg-card/75 p-4 aura-shadow-xs',
        task.completed && 'opacity-55'
      )}
      role="article"
    >
      <div className="flex items-start gap-3">
        <CompletionCheckbox checked={task.completed} onChange={handleComplete} className="mt-0.5" />

        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'text-[1.02rem] font-medium leading-normal text-foreground',
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
              <span className="text-xs italic text-muted-foreground">
                {formatDueDate(task.dueDate)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {hasDetails ? (
        <div className="mt-3 ml-9 space-y-2">
          {task.subtasks.length > 0 ? (
            <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground" role="list">
              {task.subtasks.map((subtask, index) => (
                <li key={index}>
                  {index + 1}. {subtask}
                </li>
              ))}
            </ul>
          ) : null}
          {task.notes ? (
            <p className="text-xs italic leading-relaxed text-muted-foreground/80">{task.notes}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
