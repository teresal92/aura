'use client'

import { create } from 'zustand'
import type { Task, Priority } from '@/types/task'

interface TaskState {
  tasks: Task[]
  focusTaskId: string | null
  isInputLoading: boolean

  addTasks: (tasks: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt'>[]) => void
  completeTask: (id: string) => void
  uncompleteTask: (id: string) => void
  deleteTask: (id: string) => void
  setFocusTask: (id: string | null) => void
  setInputLoading: (loading: boolean) => void
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

const priorityOrder: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  focusTaskId: null,
  isInputLoading: false,

  addTasks: (newTasks) =>
    set((state) => {
      const tasksWithMeta: Task[] = newTasks.map((task) => ({
        ...task,
        id: generateId(),
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      }))
      return { tasks: sortTasks([...state.tasks, ...tasksWithMeta]) }
    }),

  completeTask: (id) =>
    set((state) => ({
      tasks: sortTasks(
        state.tasks.map((task) =>
          task.id === id
            ? { ...task, completed: true, completedAt: new Date().toISOString() }
            : task
        )
      ),
    })),

  uncompleteTask: (id) =>
    set((state) => ({
      tasks: sortTasks(
        state.tasks.map((task) =>
          task.id === id ? { ...task, completed: false, completedAt: null } : task
        )
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      focusTaskId: state.focusTaskId === id ? null : state.focusTaskId,
    })),

  setFocusTask: (id) => set({ focusTaskId: id }),

  setInputLoading: (loading) => set({ isInputLoading: loading }),
}))
