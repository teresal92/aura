'use client'

import { useTaskStore } from '@/store/tasks'
import { TaskCard } from '@/components/TaskCard'
import { SectionHeader } from '@/components/aura-primitives'

export function TaskList() {
  const { tasks } = useTaskStore()

  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  if (tasks.length === 0) return null

  return (
    <div className="space-y-8">
      {activeTasks.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader count={activeTasks.length}>To do ·</SectionHeader>
          <div className="space-y-2.5">
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      ) : null}

      {completedTasks.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader count={completedTasks.length}>Done ·</SectionHeader>
          <div className="space-y-2.5">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
