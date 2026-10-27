'use client'

import { isCompleted } from '@/lib/tasks/mappers'
import { useTaskStore } from '@/store/tasks'
import { TaskCard } from '@/components/TaskCard'
import { SectionHeader } from '@/components/aura-primitives'

export function TaskList() {
  const { tasks } = useTaskStore()

  const activeTasks = tasks.filter((task) => !isCompleted(task))
  const completedTasks = tasks.filter(isCompleted)

  if (tasks.length === 0) return null

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-8">
      <p className="font-heading text-xl text-foreground lining-nums">{today}</p>
      {activeTasks.length > 0 ? (
        <section className="space-y-4">
          <SectionHeader count={activeTasks.length}>To do ·</SectionHeader>
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      ) : null}

      {completedTasks.length > 0 ? (
        <section className="space-y-4">
          <SectionHeader count={completedTasks.length}>Done ·</SectionHeader>
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
