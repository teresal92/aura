import { useSyncExternalStore } from 'react'
import { todayIn } from '@/lib/dates'
import type { ParsedTaskResponse, Task } from '@/types/task'

// Dev-only placeholder tasks for previewing the task list without signing in or calling the AI.
// Toggled from <DevPreviewToggle />; the on/off state persists in localStorage.

const STORAGE_KEY = 'aura:preview-tasks'
const PREVIEW_ID_PREFIX = 'preview-'
const isDev = process.env.NODE_ENV === 'development'
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function getSnapshot() {
  return isDev && window.localStorage.getItem(STORAGE_KEY) === '1'
}

export function usePreviewTasksEnabled() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export function setPreviewTasksEnabled(enabled: boolean) {
  if (enabled) window.localStorage.setItem(STORAGE_KEY, '1')
  else window.localStorage.removeItem(STORAGE_KEY)
  listeners.forEach((listener) => listener())
}

export function isPreviewTask(task: Task) {
  return task.id.startsWith(PREVIEW_ID_PREFIX)
}

// The last task is marked done so both list sections show.
export function createPreviewTasks(): Task[] {
  const createdAt = new Date().toISOString()
  return PREVIEW_TASKS.map((task, index) => {
    const isLast = index === PREVIEW_TASKS.length - 1
    return {
      ...task,
      id: `${PREVIEW_ID_PREFIX}${index}`,
      completedAt: isLast ? createdAt : null,
      createdAt,
    }
  })
}

const PREVIEW_TASKS: ParsedTaskResponse['tasks'] = [
  {
    title: 'Pay the electricity bill',
    priority: 'urgent',
    estimatedDuration: 10,
    dueDate: todayIn(),
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
