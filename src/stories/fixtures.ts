import type { NewTask, Task } from '@/types/task'

// Sample tasks covering every priority and each optional field (subtasks, notes, due date).

export const ACTIVE_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Renew passport before the Lisbon trip',
    priority: 'urgent',
    estimatedDuration: 45,
    dueDate: '2026-11-10',
    category: 'Personal',
    subtasks: ['Find old passport', 'Get new photos taken', 'Book appointment at the post office'],
    notes: 'Current one expires in January; Portugal needs 3 months validity.',
    completedAt: null,
    createdAt: '2026-11-01T16:00:00.000Z',
  },
  {
    id: 'task-2',
    title: 'Send Q4 budget draft to Maya',
    priority: 'high',
    estimatedDuration: 90,
    dueDate: '2026-11-07',
    category: 'Work',
    subtasks: [],
    notes: null,
    completedAt: null,
    createdAt: '2026-11-01T16:00:00.000Z',
  },
  {
    id: 'task-3',
    title: 'Call the dentist about the crown',
    priority: 'medium',
    estimatedDuration: 15,
    dueDate: null,
    category: 'Health',
    subtasks: [],
    notes: null,
    completedAt: null,
    createdAt: '2026-11-01T16:00:00.000Z',
  },
  {
    id: 'task-4',
    title: 'Plan a weekend in Yosemite',
    priority: 'low',
    estimatedDuration: 120,
    dueDate: '2027-02-14',
    category: 'Home',
    subtasks: [],
    notes: 'Maybe after the holidays.',
    completedAt: null,
    createdAt: '2026-11-01T16:00:00.000Z',
  },
]

export const DONE_TASKS: Task[] = [
  {
    id: 'task-5',
    title: 'Pay the electricity bill',
    priority: 'high',
    estimatedDuration: 10,
    dueDate: '2026-11-05',
    category: 'Finance',
    subtasks: [],
    notes: null,
    completedAt: '2026-11-05T18:30:00.000Z',
    createdAt: '2026-11-01T16:00:00.000Z',
  },
]

export const ALL_TASKS: Task[] = [...ACTIVE_TASKS, ...DONE_TASKS]

export const PARSED_TASKS: NewTask[] = [
  {
    title: 'Book flights to Lisbon',
    priority: 'high',
    estimatedDuration: 30,
    dueDate: null,
    category: 'Personal',
    subtasks: [],
    notes: null,
  },
]

export const BRAIN_DUMP =
  'book flights to lisbon, call the dentist, budget draft for maya by friday'
