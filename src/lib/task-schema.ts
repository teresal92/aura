import { z } from 'zod'
import { toIsoDate } from '@/lib/dates'
import { PRIORITIES } from '@/types/task'

// What the model returns, without transforms: OpenAI's zodTextFormat converts this to JSON Schema,
// and Zod throws on transforms there. Normalization happens in parsedTaskSchema.
const modelTaskSchema = z.object({
  title: z.string(),
  priority: z.enum(PRIORITIES),
  estimatedDuration: z.number(),
  dueDate: z.string().nullish(),
  category: z.string(),
  subtasks: z.array(z.string()).default([]),
  notes: z.string().nullish(),
})

export const modelResponseSchema = z.object({ tasks: z.array(modelTaskSchema) })

export const parsedTaskSchema = z.object({
  tasks: z.array(
    modelTaskSchema.transform((task) => ({
      ...task,
      // Minutes, stored as a non-negative integer. The model can return 7.5 or a negative value.
      estimatedDuration: Math.max(0, Math.round(task.estimatedDuration)),
      // Lenient: an unreadable date becomes null rather than failing the whole parse.
      dueDate: toIsoDate(task.dueDate),
      notes: task.notes ?? null,
    }))
  ),
})
