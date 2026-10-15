export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export type Category = 'Home' | 'Work' | 'Health' | 'Communication' | 'Finance' | 'Personal'

// A follow-up question the LLM flagged for a task, answered by picking one option.
export interface Clarification {
  question: string
  options: string[]
  // Short note shown under the task while it's unresolved, e.g. "which project?"
  label: string
}

export interface Task {
  id: string
  title: string
  priority: Priority
  estimatedDuration: number
  dueDate: string | null
  category: Category | string
  subtasks: string[]
  notes: string | null
  // Loose end: the LLM couldn't place this task without more information.
  ambiguous: boolean
  // Ambiguous tasks should carry one; others may carry an optional "ask me more" question.
  clarification: Clarification | null
  completed: boolean
  completedAt: string | null
  createdAt: string
}

export interface ParsedTaskResponse {
  tasks: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt'>[]
}
