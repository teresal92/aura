// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { taskKeys } from '@/lib/query/keys'
import {
  useCreateTasks,
  useDeleteTask,
  useSetCompleted,
  useTaskChangeFailed,
  useTasks,
} from '@/lib/query/tasks'
import type { Task } from '@/types/task'

const auth = vi.hoisted(() => ({ isSignedIn: true, userId: 'user_1' as string | null }))

vi.mock('@clerk/nextjs', () => ({ useAuth: () => ({ isLoaded: true, ...auth }) }))

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'task',
    title: 'Task',
    priority: 'medium',
    estimatedDuration: 10,
    dueDate: null,
    category: 'Home',
    subtasks: [],
    notes: null,
    completedAt: null,
    createdAt: '2026-10-27T12:00:00.000Z',
    ...overrides,
  }
}

const key = taskKeys.user('user_1')
let queryClient: QueryClient

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

function stubFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(handler))
}

beforeEach(() => {
  auth.isSignedIn = true
  auth.userId = 'user_1'
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useTasks', () => {
  it('loads the user’s tasks, sorted when read', async () => {
    const low = makeTask({ id: 'low', priority: 'low' })
    const urgent = makeTask({ id: 'urgent', priority: 'urgent' })
    stubFetch(() => Response.json({ tasks: [low, urgent] }))

    const { result } = renderHook(() => useTasks(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.map((task) => task.id)).toEqual(['urgent', 'low'])
    expect(queryClient.getQueryData<Task[]>(key)?.map((task) => task.id)).toEqual(['low', 'urgent'])
  })

  it('does not fetch when signed out', () => {
    auth.isSignedIn = false
    auth.userId = null
    stubFetch(() => Response.json({ tasks: [] }))

    const { result } = renderHook(() => useTasks(), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('useCreateTasks', () => {
  it('adds the saved tasks to the cache once the server returns them', async () => {
    const existing = makeTask({ id: 'existing' })
    const created = makeTask({ id: 'created', title: 'Call mom' })
    queryClient.setQueryData(key, [existing])
    stubFetch(() => Response.json({ tasks: [created] }, { status: 201 }))

    const { result } = renderHook(() => useCreateTasks(), { wrapper })
    await act(() => result.current.mutateAsync([created]))

    expect(queryClient.getQueryData(key)).toEqual([existing, created])
  })
})

describe('useSetCompleted', () => {
  it('sends only the completion flag and keeps the server’s completedAt', async () => {
    const task = makeTask({ id: 'a' })
    const saved = { ...task, completedAt: '2026-10-27T13:00:00.000Z' }
    queryClient.setQueryData(key, [task])
    stubFetch(() => Response.json({ task: saved }))

    const { result } = renderHook(() => useSetCompleted(), { wrapper })
    await act(() => result.current.mutateAsync({ id: 'a', completed: true }))

    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('/api/tasks/a')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(String(init?.body))).toEqual({ completed: true })
    expect(queryClient.getQueryData(key)).toEqual([saved])
  })

  it('updates the cache right away and rolls back when the save fails', async () => {
    const task = makeTask({ id: 'a' })
    queryClient.setQueryData(key, [task])
    let fail!: () => void
    stubFetch(
      () =>
        new Promise<Response>((resolve) => {
          fail = () => resolve(Response.json({ error: 'Failed' }, { status: 500 }))
        })
    )

    const { result } = renderHook(() => useSetCompleted(), { wrapper })
    act(() => result.current.mutate({ id: 'a', completed: true }))

    await waitFor(() =>
      expect(queryClient.getQueryData<Task[]>(key)?.[0].completedAt).not.toBeNull()
    )
    fail()
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(queryClient.getQueryData(key)).toEqual([task])
  })
})

describe('useDeleteTask', () => {
  it('removes the task right away', async () => {
    const a = makeTask({ id: 'a' })
    const b = makeTask({ id: 'b' })
    queryClient.setQueryData(key, [a, b])
    stubFetch(() => new Response(null, { status: 204 }))

    const { result } = renderHook(() => useDeleteTask(), { wrapper })
    await act(() => result.current.mutateAsync('a'))

    expect(vi.mocked(fetch).mock.calls[0]).toEqual(['/api/tasks/a', { method: 'DELETE' }])
    expect(queryClient.getQueryData(key)).toEqual([b])
  })

  it('restores the task when the delete fails', async () => {
    const a = makeTask({ id: 'a' })
    queryClient.setQueryData(key, [a])
    stubFetch(() => Response.json({ error: 'Failed' }, { status: 500 }))

    const { result } = renderHook(() => useDeleteTask(), { wrapper })
    await act(() => result.current.mutateAsync('a').catch(() => {}))

    expect(queryClient.getQueryData(key)).toEqual([a])
  })
})

describe('useTaskChangeFailed', () => {
  it('reports a failed delete even after the card that started it is gone', async () => {
    queryClient.setQueryData(key, [makeTask({ id: 'a' })])
    stubFetch(() => Response.json({ error: 'Failed' }, { status: 500 }))

    const deleter = renderHook(() => useDeleteTask(), { wrapper })
    await act(() => deleter.result.current.mutateAsync('a').catch(() => {}))
    deleter.unmount()

    const { result } = renderHook(() => useTaskChangeFailed('a'), { wrapper })
    expect(result.current).toBe(true)
  })

  it('clears once a later change to the task succeeds', async () => {
    const task = makeTask({ id: 'a' })
    queryClient.setQueryData(key, [task])
    stubFetch(() => Response.json({ error: 'Failed' }, { status: 500 }))
    const { result } = renderHook(
      () => ({ setCompleted: useSetCompleted(), failed: useTaskChangeFailed('a') }),
      { wrapper }
    )

    await act(() =>
      result.current.setCompleted.mutateAsync({ id: 'a', completed: true }).catch(() => {})
    )
    await waitFor(() => expect(result.current.failed).toBe(true))

    stubFetch((url) =>
      url === '/api/tasks'
        ? Response.json({ tasks: [task] })
        : Response.json({ task: { ...task, completedAt: '2026-10-27T13:00:00.000Z' } })
    )
    await act(() => result.current.setCompleted.mutateAsync({ id: 'a', completed: true }))
    await waitFor(() => expect(result.current.failed).toBe(false))
  })
})
