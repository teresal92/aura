import { describe, expect, it } from 'vitest'
import { zodTextFormat } from 'openai/helpers/zod'
import { modelResponseSchema, parsedTaskSchema } from '@/lib/tasks/schema'
import { Constants } from '@/types/database'
import { PRIORITIES } from '@/types/task'

function parseDuration(estimatedDuration: number): number {
  const { tasks } = parsedTaskSchema.parse({
    tasks: [{ title: 'Task', priority: 'low', estimatedDuration, category: 'Home' }],
  })
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
})

describe('modelResponseSchema', () => {
  // OpenAI's structured output needs a JSON Schema, and Zod can't represent transforms in one.
  it('converts to an OpenAI text format', () => {
    expect(() => zodTextFormat(modelResponseSchema, 'task_parse')).not.toThrow()
  })
})
