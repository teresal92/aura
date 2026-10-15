'use client'

import { create } from 'zustand'
import type { Task, Priority } from '@/types/task'

interface TaskState {
  tasks: Task[]
  focusTaskId: string | null
  isInputLoading: boolean
  // True while the post-dump organized/follow-up screen is showing.
  isReviewing: boolean
  dumpCount: number

  addTasks: (tasks: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt'>[]) => void
  completeTask: (id: string) => void
  uncompleteTask: (id: string) => void
  deleteTask: (id: string) => void
  setFocusTask: (id: string | null) => void
  setInputLoading: (loading: boolean) => void
  startReview: () => void
  endReview: () => void
  // Prototype: records each picked option on its task and clears the flag. A follow-up LLM
  // pass should eventually restructure tasks using these answers.
  answerClarifications: (answers: Record<string, string>) => void
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

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  focusTaskId: null,
  isInputLoading: false,
  isReviewing: false,
  dumpCount: 0,

  addTasks: (newTasks) =>
    set((state) => {
      const createdAt = new Date().toISOString()
      const tasksWithMeta: Task[] = newTasks.map((task) => ({
        ...task,
        id: generateId(),
        completed: false,
        completedAt: null,
        createdAt,
      }))
      return {
        tasks: sortTasks([...state.tasks, ...tasksWithMeta]),
        dumpCount: state.dumpCount + 1,
      }
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

  startReview: () => set({ isReviewing: true }),

  endReview: () => set({ isReviewing: false }),

  answerClarifications: (answers) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        const answer = answers[task.id]
        if (!answer || !task.clarification) return task
        const note = `${task.clarification.question} ${answer}`
        return {
          ...task,
          ambiguous: false,
          clarification: null,
          notes: task.notes ? `${task.notes}\n${note}` : note,
        }
      }),
    })),
}))
