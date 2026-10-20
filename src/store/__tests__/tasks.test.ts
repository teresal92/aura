import { describe, expect, it } from 'vitest'
import { sortTasks } from '@/store/tasks'
import type { Task } from '@/types/task'

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'task',
    title: 'Task',
    priority: 'medium',
    estimatedDuration: 10,
    dueDate: null,
    category: 'Home',
    subtasks: [],
    notes: null,
    completedAt: null,
    createdAt: '2026-10-19T12:00:00.000Z',
    ...overrides,
  }
}

describe('sortTasks', () => {
  it('puts tasks with a completedAt after open tasks, then orders by priority', () => {
    const done = makeTask({
      id: 'done',
      priority: 'urgent',
      completedAt: '2026-10-19T13:00:00.000Z',
    })
    const low = makeTask({ id: 'low', priority: 'low' })
    const high = makeTask({ id: 'high', priority: 'high' })

    expect(sortTasks([done, low, high]).map((task) => task.id)).toEqual(['high', 'low', 'done'])
  })
})
