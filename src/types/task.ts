// The database enum `task_priority` is written separately in SQL; a test keeps the two in sync.
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const

export type Priority = (typeof PRIORITIES)[number]

export type Category = 'Home' | 'Work' | 'Health' | 'Communication' | 'Finance' | 'Personal'

/** Calendar date, "YYYY-MM-DD" (Postgres `date`). Not an instant; see src/lib/dates.ts. */
export type IsoDate = string

/** Instant, ISO 8601 in UTC, e.g. "2026-10-20T01:41:07.123Z" (Postgres `timestamptz`). */
export type IsoTimestamp = string

export interface Task {
  id: string
  title: string
  priority: Priority
  estimatedDuration: number
  dueDate: IsoDate | null
  category: Category | string
  subtasks: string[]
  notes: string | null
  completedAt: IsoTimestamp | null
  createdAt: IsoTimestamp
}

/** A task before it is saved, as parsed from the user's input. */
export type NewTask = Omit<Task, 'id' | 'completedAt' | 'createdAt'>

/** Fields the user can change. Completion is a flag; the server stamps completedAt. */
export type TaskPatch = Partial<
  Pick<
    Task,
    'title' | 'priority' | 'estimatedDuration' | 'dueDate' | 'category' | 'subtasks' | 'notes'
  >
> & { completed?: boolean }

export interface ParsedTaskResponse {
  tasks: NewTask[]
}
