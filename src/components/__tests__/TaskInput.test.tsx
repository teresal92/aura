// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskInput } from '@/components/TaskInput'
import { TaskList } from '@/components/TaskList'
import { useTaskStore } from '@/store/tasks'

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true, userId: 'user_1' }),
  useClerk: () => ({ openSignIn: vi.fn() }),
}))

const parsedTask = {
  title: 'Call mom',
  priority: 'high',
  estimatedDuration: 15,
  dueDate: null,
  category: 'Communication',
  subtasks: [],
  notes: null,
}

const savedTask = {
  ...parsedTask,
  id: '6f1c0f3e-8a5b-4f43-9a51-6d1b1f1b2c3d',
  completedAt: null,
  createdAt: '2026-10-27T12:00:00.000Z',
}

// Routes each request by method and URL; `saveResponses` are used in order for POST /api/tasks.
function stubFetch({
  parse = () => Response.json({ tasks: [parsedTask] }),
  saveResponses = [() => Response.json({ tasks: [savedTask] }, { status: 201 })],
}: {
  parse?: () => Response
  saveResponses?: (() => Response)[]
} = {}) {
  let saveCount = 0
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/parse-tasks') return parse()
      if (url === '/api/tasks' && init?.method === 'POST') return saveResponses[saveCount++]()
      if (url === '/api/tasks') return Response.json({ tasks: [] })
      throw new Error(`Unexpected request: ${init?.method ?? 'GET'} ${url}`)
    })
  )
}

function callsTo(url: string, method = 'GET') {
  return vi
    .mocked(fetch)
    .mock.calls.filter(
      ([calledUrl, init]) => calledUrl === url && (init?.method ?? 'GET') === method
    )
}

function renderWithQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function organize(text: string) {
  fireEvent.change(screen.getByRole('textbox'), { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: 'Organize tasks' }))
}

describe('TaskInput', () => {
  beforeEach(() => {
    useTaskStore.setState({ isInputLoading: false })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('saves parsed tasks and shows them in the list', async () => {
    stubFetch()
    renderWithQuery(
      <>
        <TaskInput />
        <TaskList />
      </>
    )

    organize('call my mom')

    expect(await screen.findByRole('heading', { name: 'Call mom' })).toBeTruthy()
    const [[, init]] = callsTo('/api/tasks', 'POST')
    expect(JSON.parse(String(init?.body))).toEqual({ tasks: [parsedTask] })
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('')
  })

  it('sends the browser time zone so the server can resolve relative dates', async () => {
    stubFetch()
    renderWithQuery(<TaskInput />)

    organize('call my mom tomorrow')

    await vi.waitFor(() => expect(callsTo('/api/parse-tasks', 'POST')).toHaveLength(1))
    const [[, init]] = callsTo('/api/parse-tasks', 'POST')
    expect(JSON.parse(String(init?.body))).toEqual({
      input: 'call my mom tomorrow',
      timeZone: 'America/Los_Angeles',
    })
  })

  it('shows an error and keeps the input when parsing fails', async () => {
    stubFetch({ parse: () => Response.json({ error: 'boom' }, { status: 500 }) })
    renderWithQuery(<TaskInput />)

    organize('call my mom')

    expect((await screen.findByRole('alert')).textContent).toContain("Couldn't organize that")
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('call my mom')
    expect(callsTo('/api/tasks', 'POST')).toHaveLength(0)
  })

  it('skips the save and keeps the input when no tasks are found', async () => {
    stubFetch({ parse: () => Response.json({ tasks: [] }) })
    renderWithQuery(<TaskInput />)

    organize('hello')

    expect((await screen.findByRole('alert')).textContent).toContain("Couldn't find any tasks")
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('hello')
    expect(callsTo('/api/tasks', 'POST')).toHaveLength(0)
  })

  it('retries a failed save without parsing again', async () => {
    stubFetch({
      saveResponses: [
        () => Response.json({ error: 'Failed to save tasks' }, { status: 500 }),
        () => Response.json({ tasks: [savedTask] }, { status: 201 }),
      ],
    })
    renderWithQuery(
      <>
        <TaskInput />
        <TaskList />
      </>
    )

    organize('call my mom')
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('heading', { name: 'Call mom' })).toBeTruthy()
    expect(callsTo('/api/parse-tasks', 'POST')).toHaveLength(1)
    expect(callsTo('/api/tasks', 'POST')).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
  })
})
