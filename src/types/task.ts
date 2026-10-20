export type Priority = 'low' | 'medium' | 'high' | 'urgent'

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

export interface ParsedTaskResponse {
  tasks: Omit<Task, 'id' | 'completedAt' | 'createdAt'>[]
}
