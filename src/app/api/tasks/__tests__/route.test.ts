import { auth } from '@clerk/nextjs/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/tasks/route'
import { createTasks } from '@/lib/tasks/repository'
import type { NewTask, Task } from '@/types/task'

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))
vi.mock('@/lib/tasks/repository', () => ({ createTasks: vi.fn() }))

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
    ['an unknown priority', { tasks: [{ ...draft, priority: 'someday' }] }],
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
    expect(await response.json()).toEqual({ error: expect.any(String) })
    expect(createTasks).not.toHaveBeenCalled()
  })

  it('saves the tasks and returns them with 201', async () => {
    vi.mocked(createTasks).mockResolvedValue([saved])

    const response = await post({ tasks: [draft] })

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ tasks: [saved] })
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
