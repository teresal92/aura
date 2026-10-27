import { z } from 'zod'
import { toIsoDate } from '@/lib/dates'
import { PRIORITIES, type NewTask } from '@/types/task'

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

// Strict, unlike parsedTaskSchema: this validates what the client sends to be saved, so a bad
// value is rejected rather than repaired.
export const newTaskSchema = z.object({
  title: z.string().trim().min(1),
  priority: z.enum(PRIORITIES),
  estimatedDuration: z.number().int().nonnegative(),
  dueDate: z
    .string()
    .refine((v) => toIsoDate(v) === v, 'Expected a calendar date, "YYYY-MM-DD"')
    .nullable(),
  category: z.string().trim().min(1),
  subtasks: z.array(z.string()),
  notes: z.string().nullable(),
}) satisfies z.ZodType<NewTask>
