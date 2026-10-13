import type { ParsedTaskResponse } from '@/types/task'

// Temporary sample data for previewing the task list styling without signing in.
export const PREVIEW_TASKS: ParsedTaskResponse['tasks'] = [
  {
    title: 'Pay the electricity bill',
    priority: 'urgent',
    estimatedDuration: 10,
    dueDate: new Date().toISOString().slice(0, 10),
    category: 'Finance',
    subtasks: [],
    notes: null,
  },
  {
    title: 'Call mom about the weekend',
    priority: 'high',
    estimatedDuration: 20,
    dueDate: null,
    category: 'Communication',
    subtasks: ['Check train times', 'Ask what to bring'],
    notes: null,
  },
  {
    title: 'Do laundry',
    priority: 'medium',
    estimatedDuration: 45,
    dueDate: null,
    category: 'Home',
    subtasks: [],
    notes: 'Darks and towels',
  },
  {
    title: 'Book a dentist appointment',
    priority: 'low',
    estimatedDuration: 5,
    dueDate: null,
    category: 'Health',
    subtasks: [],
    notes: null,
  },
  {
    title: 'Water the plants',
    priority: 'low',
    estimatedDuration: 5,
    dueDate: null,
    category: 'Home',
    subtasks: [],
    notes: null,
  },
]
