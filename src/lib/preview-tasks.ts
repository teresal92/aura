import { useSyncExternalStore } from 'react'
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

export function createPreviewTasks(): Task[] {
  const createdAt = new Date().toISOString()
  return PREVIEW_TASKS.map((task, index) => ({
    ...task,
    id: `${PREVIEW_ID_PREFIX}${index}`,
    completed: false,
    completedAt: null,
    createdAt,
  }))
}

function daysFromNow(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const base = { subtasks: [], notes: null, ambiguous: false, clarification: null }

// Mirrors the "Organized result + clarify" mockup: two loose ends plus one optional question.
const PREVIEW_TASKS: ParsedTaskResponse['tasks'] = [
  {
    ...base,
    title: 'Email landlord about the leak',
    priority: 'urgent',
    estimatedDuration: 10,
    dueDate: null,
    category: 'Home',
  },
  {
    ...base,
    title: 'Pick up dog food',
    priority: 'medium',
    estimatedDuration: 30,
    dueDate: daysFromNow(0),
    category: 'Errand',
  },
  {
    ...base,
    title: 'Reply to recruiter',
    priority: 'high',
    estimatedDuration: 15,
    dueDate: null,
    category: 'Job search',
  },
  {
    ...base,
    title: 'Book campsite for Tahoe',
    priority: 'medium',
    estimatedDuration: 20,
    dueDate: daysFromNow(4),
    category: 'Trip',
  },
  {
    ...base,
    title: 'Draft next Substack issue',
    priority: 'medium',
    estimatedDuration: 90,
    dueDate: null,
    category: 'Writing',
  },
  {
    ...base,
    title: 'Book vet appointment',
    priority: 'low',
    estimatedDuration: 10,
    dueDate: null,
    category: 'Health',
    clarification: {
      question: 'Vet appointment — does it need a date?',
      options: ['This week', 'Later', 'Already booked'],
      label: 'when?',
    },
  },
  {
    ...base,
    title: 'Call Dana about the cabin',
    priority: 'medium',
    estimatedDuration: 15,
    dueDate: null,
    category: 'Communication',
    ambiguous: true,
    clarification: {
      question: '“Call Dana about the cabin” — is this for the Tahoe trip?',
      options: ['Yes, Tahoe trip', 'No, separate'],
      label: 'task — which project?',
    },
  },
  {
    ...base,
    title: 'Redwoods idea for the Substack',
    priority: 'low',
    estimatedDuration: 15,
    dueDate: null,
    category: 'Writing',
    ambiguous: true,
    clarification: {
      question: '“Redwoods idea for the Substack” — a task or a thought to keep?',
      options: ['Task', 'Just a thought'],
      label: 'task or thought?',
    },
  },
]
