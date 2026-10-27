import { describe, expect, it } from 'vitest'
import { isCompleted, toTask, toTaskInsert, toTaskUpdate } from '@/lib/tasks/mappers'
import type { Tables } from '@/types/database'
import type { NewTask, Task } from '@/types/task'

describe('isCompleted', () => {
  it('is true only when completedAt is set', () => {
    expect(isCompleted({ completedAt: '2026-10-19T13:00:00.000Z' })).toBe(true)
    expect(isCompleted({ completedAt: null })).toBe(false)
  })

  it('treats a missing completedAt as not completed', () => {
    const fromJson = JSON.parse('{}') as Pick<Task, 'completedAt'>

    expect(isCompleted(fromJson)).toBe(false)
  })
})

describe('toTask', () => {
  // Shaped like a PostgREST response: timestamptz as +00:00 with microseconds.
  const row: Tables<'tasks'> = {
    id: '6f1c2b8e-0d3a-4c6f-9a51-2b7e8d4f0a13',
    user_id: 'user_2abc',
    seq: 42,
    title: 'Call the dentist',
    priority: 'high',
    estimated_duration: 15,
    due_date: '2026-11-01',
    category: 'Health',
    subtasks: ['Find insurance card'],
    notes: null,
    completed_at: '2026-10-20T01:41:07.123456+00:00',
    created_at: '2026-10-19T23:05:00+00:00',
  }

  it('outputs ...Z timestamps', () => {
    const task = toTask(row)

    expect(task.completedAt).toBe('2026-10-20T01:41:07.123Z')
    expect(task.createdAt).toBe('2026-10-19T23:05:00.000Z')
  })

  it('keeps a null completedAt', () => {
    expect(toTask({ ...row, completed_at: null }).completedAt).toBeNull()
  })

  it('leaves dueDate unchanged', () => {
    expect(toTask(row).dueDate).toBe('2026-11-01')
  })

  it('drops the internal columns', () => {
    const task = toTask(row)

    expect(task).not.toHaveProperty('user_id')
    expect(task).not.toHaveProperty('seq')
    expect(Object.keys(task).sort()).toEqual(
      [
        'id',
        'title',
        'priority',
        'estimatedDuration',
        'dueDate',
        'category',
        'subtasks',
        'notes',
        'completedAt',
        'createdAt',
      ].sort()
    )
  })
})

describe('toTaskInsert', () => {
  it('maps a parsed task to row columns', () => {
    const task: NewTask = {
      title: 'Call the dentist',
      priority: 'high',
      estimatedDuration: 15,
      dueDate: '2026-11-01',
      category: 'Health',
      subtasks: ['Find insurance card'],
      notes: null,
    }

    expect(toTaskInsert(task)).toEqual({
      title: 'Call the dentist',
      priority: 'high',
      estimated_duration: 15,
      due_date: '2026-11-01',
      category: 'Health',
      subtasks: ['Find insurance card'],
      notes: null,
    })
  })
})

describe('toTaskUpdate', () => {
  const now = new Date('2026-10-27T08:00:00.000Z')

  it('maps only the fields in the patch', () => {
    expect(toTaskUpdate({ title: 'Renamed', estimatedDuration: 30, dueDate: null }, now)).toEqual({
      title: 'Renamed',
      estimated_duration: 30,
      due_date: null,
    })
  })

  it('stamps completed_at with the server time when completed', () => {
    expect(toTaskUpdate({ completed: true }, now)).toEqual({
      completed_at: '2026-10-27T08:00:00.000Z',
    })
  })

  it('clears completed_at when uncompleted', () => {
    expect(toTaskUpdate({ completed: false }, now)).toEqual({ completed_at: null })
  })

  it('returns no columns for an empty patch', () => {
    expect(toTaskUpdate({}, now)).toEqual({})
  })
})
