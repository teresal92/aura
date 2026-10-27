import { useSyncExternalStore } from 'react'
import { todayIn } from '@/lib/dates'
import type { ParsedTaskResponse, Task } from '@/types/task'

// Dev-only placeholder tasks for previewing the task list without signing in or calling the AI.
// Toggled from <DevPreviewToggle />; the on/off state persists in localStorage. The tasks
// themselves live only in memory here: checking or deleting one never calls the API.

const STORAGE_KEY = 'aura:preview-tasks'
const PREVIEW_ID_PREFIX = 'preview-'
const isDev = process.env.NODE_ENV === 'development'
const listeners = new Set<() => void>()
const NO_TASKS: Task[] = []

// Created on first read, so the dates are the browser's, and reset each time the toggle turns on.
let previewTasks: Task[] | null = null

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

function getPreviewTasks() {
  previewTasks ??= createPreviewTasks()
  return previewTasks
}

function notify() {
  listeners.forEach((listener) => listener())
}

export function usePreviewTasksEnabled() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

/** The preview tasks while the toggle is on, otherwise none. */
export function usePreviewTasks(): Task[] {
  const enabled = usePreviewTasksEnabled()
  const tasks = useSyncExternalStore(subscribe, getPreviewTasks, () => NO_TASKS)
  return enabled ? tasks : NO_TASKS
}

export function setPreviewTasksEnabled(enabled: boolean) {
  if (enabled) {
    window.localStorage.setItem(STORAGE_KEY, '1')
    previewTasks = createPreviewTasks()
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
  notify()
}

export function setPreviewTaskCompleted(id: string, completed: boolean) {
  const completedAt = completed ? new Date().toISOString() : null
  previewTasks = getPreviewTasks().map((task) => (task.id === id ? { ...task, completedAt } : task))
  notify()
}

export function deletePreviewTask(id: string) {
  previewTasks = getPreviewTasks().filter((task) => task.id !== id)
  notify()
}

export function isPreviewTask(task: Task) {
  return task.id.startsWith(PREVIEW_ID_PREFIX)
}

// The last task is marked done so both list sections show.
function createPreviewTasks(): Task[] {
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
