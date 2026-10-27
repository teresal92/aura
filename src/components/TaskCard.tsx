'use client'

import type { Task } from '@/types/task'
import { useTaskStore } from '@/store/tasks'
import {
  CategoryBadge,
  CompletionCheckbox,
  IconButton,
  MetaText,
  PriorityBadge,
} from '@/components/aura-primitives'
import { cn } from '@/lib/utils'
import { formatDueDate } from '@/lib/dates'
import { useDeleteTask, useSetCompleted, useTaskChangeFailed } from '@/lib/query/tasks'
import { isCompleted } from '@/lib/tasks/mappers'
import { deletePreviewTask, isPreviewTask, setPreviewTaskCompleted } from '@/lib/tasks/preview'

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
}

export function TaskCard({ task }: { task: Task }) {
  const setCompleted = useSetCompleted()
  const deleteTask = useDeleteTask()
  const changeFailed = useTaskChangeFailed(task.id)
  const completed = isCompleted(task)
  // Dev preview tasks aren't saved, so they change locally and never call the API.
  const isPreview = isPreviewTask(task)

  function handleComplete() {
    if (isPreview) setPreviewTaskCompleted(task.id, !completed)
    else setCompleted.mutate({ id: task.id, completed: !completed })
  }

  function handleDelete() {
    const { focusTaskId, setFocusTask } = useTaskStore.getState()
    if (focusTaskId === task.id) setFocusTask(null)

    if (isPreview) deletePreviewTask(task.id)
    else deleteTask.mutate(task.id)
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

          {changeFailed ? (
            <p role="alert" className="mt-2 text-base text-destructive">
              Couldn&apos;t save that change. Try again.
            </p>
          ) : null}
        </div>

        <IconButton
          size="sm"
          variant="danger"
          onClick={handleDelete}
          aria-label={`Delete ${task.title}`}
          className="-mt-1 shrink-0"
        >
          <span aria-hidden="true">×</span>
        </IconButton>
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
