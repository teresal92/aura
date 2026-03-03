export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export type Category = 'Home' | 'Work' | 'Health' | 'Communication' | 'Finance' | 'Personal'

export interface Task {
  id: string
  title: string
  priority: Priority
  estimatedDuration: number
  dueDate: string | null
  category: Category | string
  subtasks: string[]
  notes: string | null
  completed: boolean
  completedAt: string | null
  createdAt: string
}

export interface ParsedTaskResponse {
  tasks: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt'>[]
}
