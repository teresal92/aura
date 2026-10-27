import { auth } from '@clerk/nextjs/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from '@/app/api/tasks/route'
import { createTasks, listTasks } from '@/lib/tasks/repository'
import type { NewTask, Task } from '@/types/task'

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))
vi.mock('@/lib/tasks/repository', () => ({ createTasks: vi.fn(), listTasks: vi.fn() }))

const draft: NewTask = {
  title: 'Call the dentist',
  priority: 'high',
  estimatedDuration: 15,
  dueDate: '2026-11-01',
  category: 'Health',
  subtasks: ['Find insurance card'],
  notes: null,
}

const saved: Task = {
  ...draft,
  id: '6f1c2b8e-0d3a-4c6f-9a51-2b7e8d4f0a13',
  completedAt: null,
  createdAt: '2026-10-27T17:00:00.000Z',
}

function post(body: unknown): Promise<Response> {
  return POST(
    new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  )
}

function signIn(userId: string | null) {
  vi.mocked(auth).mockResolvedValue({ userId } as Awaited<ReturnType<typeof auth>>)
}

describe('GET /api/tasks', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    signIn('user_2abc')
  })

  it('returns 401 when signed out', async () => {
    signIn(null)

    const response = await GET()

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(listTasks).not.toHaveBeenCalled()
  })

  it("returns the user's tasks", async () => {
    vi.mocked(listTasks).mockResolvedValue([saved])

    const response = await GET()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ tasks: [saved] })
  })

  it('returns 500 without database details when loading fails', async () => {
    const error = new Error('Failed to list tasks: permission denied for table tasks')
    vi.mocked(listTasks).mockRejectedValue(error)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await GET()

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to load tasks' })
    expect(consoleError).toHaveBeenCalledWith(error)
  })
})

describe('POST /api/tasks', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    signIn('user_2abc')
  })

  it('returns 401 when signed out', async () => {
    signIn(null)

    const response = await post({ tasks: [draft] })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(createTasks).not.toHaveBeenCalled()
  })

  it.each([
    ['a body that is not JSON', 'not json'],
    ['a missing tasks array', {}],
    ['a task without a title', { tasks: [{ ...draft, title: '' }] }],
    ['a whitespace-only title', { tasks: [{ ...draft, title: '   ' }] }],
    ['an unknown priority', { tasks: [{ ...draft, priority: 'someday' }] }],
    ['a negative estimatedDuration', { tasks: [{ ...draft, estimatedDuration: -5 }] }],
    ['a fractional estimatedDuration', { tasks: [{ ...draft, estimatedDuration: 7.5 }] }],
    [
      'an estimatedDuration too large for the database',
      { tasks: [{ ...draft, estimatedDuration: 2_147_483_648 }] },
    ],
    ['a dueDate that is not a calendar date', { tasks: [{ ...draft, dueDate: '2026-02-30' }] }],
    ['a dueDate with a time', { tasks: [{ ...draft, dueDate: '2026-11-01T17:00:00Z' }] }],
  ])('returns 400 for %s', async (_, body) => {
    const response = await post(body)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: expect.any(String),
      issues: [expect.objectContaining({ message: expect.any(String) })],
    })
    expect(createTasks).not.toHaveBeenCalled()
  })

  it('rejects the whole batch and names the bad task when one task is invalid', async () => {
    const response = await post({ tasks: [draft, { ...draft, title: '' }] })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: expect.any(String),
      issues: [{ path: ['tasks', 1, 'title'], message: expect.any(String) }],
    })
    expect(createTasks).not.toHaveBeenCalled()
  })

  it('saves the tasks and returns them with 201', async () => {
    vi.mocked(createTasks).mockResolvedValue([saved])

    const response = await post({ tasks: [draft] })

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ tasks: [saved] })
    expect(createTasks).toHaveBeenCalledWith([draft])
  })

  it('saves a task without a due date', async () => {
    const undated = { ...draft, dueDate: null }
    vi.mocked(createTasks).mockResolvedValue([{ ...saved, dueDate: null }])

    const response = await post({ tasks: [undated] })

    expect(response.status).toBe(201)
    expect(createTasks).toHaveBeenCalledWith([undated])
  })

  it('saves the title and category trimmed', async () => {
    vi.mocked(createTasks).mockResolvedValue([saved])

    await post({ tasks: [{ ...draft, title: '  Call the dentist ', category: ' Health ' }] })

    expect(createTasks).toHaveBeenCalledWith([draft])
  })

  it('returns 500 without database details when the save fails', async () => {
    const error = new Error('Failed to create tasks: permission denied for table tasks')
    vi.mocked(createTasks).mockRejectedValue(error)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await post({ tasks: [draft] })

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to save tasks' })
    expect(consoleError).toHaveBeenCalledWith(error)
  })
})
