'use client'

import { create } from 'zustand'

// UI state only. Tasks live in the TanStack Query cache (src/lib/query/tasks.ts).
interface TaskState {
  focusTaskId: string | null
  isInputLoading: boolean

  setFocusTask: (id: string | null) => void
  setInputLoading: (loading: boolean) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  focusTaskId: null,
  isInputLoading: false,

  setFocusTask: (id) => set({ focusTaskId: id }),

  setInputLoading: (loading) => set({ isInputLoading: loading }),
}))
