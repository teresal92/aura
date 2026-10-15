import { describe, expect, it } from 'vitest'
import { getClarificationQueue, getHorizon, organizeTasks } from '@/lib/organize'
import type { Task } from '@/types/task'

const now = new Date('2026-03-02T10:00:00-08:00')

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.title ?? 'task',
    title: 'Task',
    priority: 'medium',
    estimatedDuration: 15,
    dueDate: null,
    category: 'Home',
    subtasks: [],
    notes: null,
    ambiguous: false,
    clarification: null,
    completed: false,
    completedAt: null,
    createdAt: now.toISOString(),
    ...overrides,
  }
}

const clarification = { question: 'Which project?', options: ['A', 'B'], label: 'which project?' }

describe('getHorizon', () => {
  it('buckets dated tasks by local day distance', () => {
    expect(getHorizon(makeTask({ dueDate: '2026-03-01T12:00:00-08:00' }), now)).toBe('today')
    expect(getHorizon(makeTask({ dueDate: '2026-03-02T23:59:00-08:00' }), now)).toBe('today')
    expect(getHorizon(makeTask({ dueDate: '2026-03-09T12:00:00-08:00' }), now)).toBe('week')
    expect(getHorizon(makeTask({ dueDate: '2026-03-10T12:00:00-08:00' }), now)).toBe('later')
  })

  it('falls back to priority for undated tasks', () => {
    expect(getHorizon(makeTask({ priority: 'urgent' }), now)).toBe('today')
    expect(getHorizon(makeTask({ priority: 'high' }), now)).toBe('today')
    expect(getHorizon(makeTask({ priority: 'medium' }), now)).toBe('week')
    expect(getHorizon(makeTask({ priority: 'low' }), now)).toBe('later')
  })
})

describe('organizeTasks', () => {
  it('keeps open loose ends out of the dated sections', () => {
    const looseEnd = makeTask({ title: 'Loose', priority: 'urgent', ambiguous: true })
    const doneLooseEnd = makeTask({ title: 'Done loose', ambiguous: true, completed: true })

    const organized = organizeTasks([looseEnd, doneLooseEnd], now)

    expect(organized.unsure).toEqual([looseEnd])
    expect(organized.week).toEqual([doneLooseEnd])
  })
})

describe('getClarificationQueue', () => {
  it('splits loose-end questions from optional ones and skips tasks without a question', () => {
    const looseEnd = makeTask({ title: 'Loose', ambiguous: true, clarification })
    const optional = makeTask({ title: 'Optional', clarification })
    const unasked = makeTask({ title: 'Unasked', ambiguous: true })
    const done = makeTask({ title: 'Done', clarification, completed: true })

    expect(getClarificationQueue([looseEnd, optional, unasked, done])).toEqual({
      required: [looseEnd],
      optional: [optional],
    })
  })
})
