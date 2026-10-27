import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { newTaskSchema, parsedTaskSchema } from '@/lib/tasks/schema'
import { Constants } from '@/types/database'
import { PRIORITIES } from '@/types/task'

const modelTask = { title: 'Task', priority: 'low', estimatedDuration: 10, category: 'Home' }

function parseDuration(estimatedDuration: number): number {
  const { tasks } = parsedTaskSchema.parse({ tasks: [{ ...modelTask, estimatedDuration }] })
  return tasks[0].estimatedDuration
}

describe('PRIORITIES', () => {
  it('matches the database enum', () => {
    expect(PRIORITIES).toEqual(Constants.public.Enums.task_priority)
  })
})

describe('parsedTaskSchema', () => {
  it('rounds estimatedDuration to a whole number', () => {
    expect(parseDuration(7.5)).toBe(8)
    expect(parseDuration(30)).toBe(30)
  })

  it('clamps a negative estimatedDuration to 0', () => {
    expect(parseDuration(-3)).toBe(0)
    expect(parseDuration(-0.4)).toBe(0)
  })

  it('clamps an estimatedDuration too large for the database', () => {
    expect(parseDuration(1e12)).toBe(2_147_483_647)
  })

  it('drops a task without a title and keeps the rest', () => {
    const { tasks } = parsedTaskSchema.parse({
      tasks: [
        { ...modelTask, title: '   ' },
        { ...modelTask, title: 'Do laundry' },
      ],
    })
    expect(tasks.map((task) => task.title)).toEqual(['Do laundry'])
  })

  it.each(['', '   '])('falls back to Personal for the category %j', (category) => {
    const { tasks } = parsedTaskSchema.parse({ tasks: [{ ...modelTask, category }] })
    expect(tasks[0].category).toBe('Personal')
  })

  it('trims the title and category', () => {
    const { tasks } = parsedTaskSchema.parse({
      tasks: [{ ...modelTask, title: '  Do laundry ', category: ' Home ' }],
    })
    expect(tasks[0]).toMatchObject({ title: 'Do laundry', category: 'Home' })
  })

  it('only returns tasks that newTaskSchema accepts for saving', () => {
    const { tasks } = parsedTaskSchema.parse({
      tasks: [
        { ...modelTask, title: '' },
        {
          title: ' Pay rent ',
          priority: 'urgent',
          estimatedDuration: -2.6,
          dueDate: '2026-02-30',
          category: '  ',
          notes: undefined,
        },
        {
          ...modelTask,
          estimatedDuration: 1e12,
          dueDate: '2026-11-01T17:00:00Z',
          subtasks: ['Sort colors'],
          notes: 'Darks',
        },
      ],
    })
    expect(tasks).toHaveLength(2)
    expect(() => z.array(newTaskSchema).parse(tasks)).not.toThrow()
  })
})
