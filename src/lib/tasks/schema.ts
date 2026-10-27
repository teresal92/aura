import { z } from 'zod'
import { toIsoDate } from '@/lib/dates'
import { PRIORITIES } from '@/types/task'

export const parsedTaskSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string(),
      priority: z.enum(PRIORITIES),
      // Minutes, stored as a non-negative integer. The model can return 7.5 or a negative value.
      estimatedDuration: z.number().transform((v) => Math.max(0, Math.round(v))),
      // Lenient: an unreadable date becomes null rather than failing the whole parse.
      dueDate: z
        .string()
        .nullish()
        .transform((v) => toIsoDate(v)),
      category: z.string(),
      subtasks: z.array(z.string()).default([]),
      notes: z
        .string()
        .nullish()
        .transform((v) => v ?? null),
    })
  ),
})
