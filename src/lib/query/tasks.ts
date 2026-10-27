'use client'

import { useAuth } from '@clerk/nextjs'
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query'
import { taskKeys, taskMutationKeys } from '@/lib/query/keys'
import { sortTasks } from '@/lib/tasks/sort'
import type { NewTask, Task } from '@/types/task'

async function request(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${url} failed: ${response.status}`)
  }
  return response
}

function jsonInit(method: string, body: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
}

async function fetchTasks(): Promise<Task[]> {
  const response = await request('/api/tasks')
  return ((await response.json()) as { tasks: Task[] }).tasks
}

async function postTasks(tasks: NewTask[]): Promise<Task[]> {
  const response = await request('/api/tasks', jsonInit('POST', { tasks }))
  return ((await response.json()) as { tasks: Task[] }).tasks
}

// Sends only the completion flag: the route rejects unknown fields, and the server stamps
// completedAt.
async function patchCompleted({ id, completed }: SetCompletedInput): Promise<Task> {
  const response = await request(`/api/tasks/${id}`, jsonInit('PATCH', { completed }))
  return ((await response.json()) as { task: Task }).task
}

async function deleteTaskRequest(id: string): Promise<void> {
  await request(`/api/tasks/${id}`, { method: 'DELETE' })
}

// Each user's tasks sit under their own key, so one account's cache is never read as another's.
function useTasksKey() {
  const { userId } = useAuth()
  return taskKeys.user(userId ?? '')
}

export function useTasks() {
  const { isSignedIn } = useAuth()
  return useQuery({
    queryKey: useTasksKey(),
    queryFn: fetchTasks,
    enabled: isSignedIn === true,
    // Sorted when read, so cache updates can append or replace without re-sorting.
    select: sortTasks,
  })
}

// Not optimistic: tasks appear once the server returns them with real ids. No retry, since
// repeating an insert can create duplicates.
export function useCreateTasks() {
  const queryClient = useQueryClient()
  const queryKey = useTasksKey()
  return useMutation({
    mutationFn: postTasks,
    onSuccess: (created) => {
      queryClient.setQueryData<Task[]>(queryKey, (tasks = []) => [...tasks, ...created])
    },
  })
}

interface SetCompletedInput {
  id: string
  completed: boolean
}

export function useSetCompleted() {
  const queryClient = useQueryClient()
  const queryKey = useTasksKey()
  return useMutation({
    mutationKey: taskMutationKeys.setCompleted,
    mutationFn: patchCompleted,
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Task[]>(queryKey)
      // Temporary client time; onSettled refetches the server's completedAt.
      const completedAt = completed ? new Date().toISOString() : null
      queryClient.setQueryData<Task[]>(queryKey, (tasks) =>
        tasks?.map((task) => (task.id === id ? { ...task, completedAt } : task))
      )
      return { previous }
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<Task[]>(queryKey, (tasks) =>
        tasks?.map((task) => (task.id === saved.id ? saved : task))
      )
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const queryKey = useTasksKey()
  return useMutation({
    mutationKey: taskMutationKeys.delete,
    mutationFn: deleteTaskRequest,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Task[]>(queryKey)
      queryClient.setQueryData<Task[]>(queryKey, (tasks) => tasks?.filter((task) => task.id !== id))
      return { previous }
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}

function changedTaskId(variables: unknown): string | undefined {
  if (typeof variables === 'string') return variables
  return (variables as SetCompletedInput | undefined)?.id
}

/**
 * Whether the latest completion or delete of this task failed and was rolled back. Read from the
 * mutation cache rather than the card's own mutation, because a failed delete brings the card back
 * as a new instance.
 */
export function useTaskChangeFailed(id: string): boolean {
  const statuses = useMutationState({
    filters: {
      mutationKey: taskMutationKeys.change,
      predicate: (mutation) => changedTaskId(mutation.state.variables) === id,
    },
    select: (mutation) => mutation.state.status,
  })
  return statuses.at(-1) === 'error'
}
