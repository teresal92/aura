import { describe, expect, it } from 'vitest'
import { isCompleted } from '@/lib/tasks'
import type { Task } from '@/types/task'

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
