import { z } from 'zod'
import { toIsoDate } from '@/lib/dates'
import { PRIORITIES, type NewTask, type ParsedTaskResponse } from '@/types/task'

// The largest Postgres `integer`, the type of estimated_duration.
const MAX_MINUTES = 2_147_483_647

// Repairs model output so every task it returns passes newTaskSchema and can be saved.
export const parsedTaskSchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().trim(),
        priority: z.enum(PRIORITIES),
        // Minutes, stored as a non-negative integer. The model can return 7.5 or a negative value.
        estimatedDuration: z
          .number()
          .transform((v) => Math.min(MAX_MINUTES, Math.max(0, Math.round(v)))),
        // Lenient: an unreadable date becomes null rather than failing the whole parse.
        dueDate: z
          .string()
          .nullish()
          .transform((v) => toIsoDate(v)),
        // An empty category falls back to the catch-all so the task can still be saved.
        category: z
          .string()
          .trim()
          .transform((v) => v || 'Personal'),
        subtasks: z.array(z.string()).default([]),
        notes: z
          .string()
          .nullish()
          .transform((v) => v ?? null),
      })
    )
    // A task without a title can't be shown or saved; drop it rather than fail the whole parse.
    .transform((tasks) => tasks.filter((task) => task.title !== '')),
}) satisfies z.ZodType<ParsedTaskResponse>

// Strict, unlike parsedTaskSchema: this validates what the client sends to be saved, so a bad
// value is rejected rather than repaired.
export const newTaskSchema = z.object({
  title: z.string().trim().min(1),
  priority: z.enum(PRIORITIES),
  estimatedDuration: z.number().int().nonnegative().max(MAX_MINUTES),
  dueDate: z
    .string()
    .refine((v) => toIsoDate(v) === v, 'Expected a calendar date, "YYYY-MM-DD"')
    .nullable(),
  category: z.string().trim().min(1),
  subtasks: z.array(z.string()),
  notes: z.string().nullable(),
}) satisfies z.ZodType<NewTask>
