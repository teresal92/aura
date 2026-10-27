import { auth } from '@clerk/nextjs/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DELETE, PATCH } from '@/app/api/tasks/[id]/route'
import { deleteTask, updateTask } from '@/lib/tasks/repository'
import type { Task } from '@/types/task'

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))
vi.mock('@/lib/tasks/repository', () => ({ updateTask: vi.fn(), deleteTask: vi.fn() }))

const id = '6f1c2b8e-0d3a-4c6f-9a51-2b7e8d4f0a13'

const task: Task = {
  id,
  title: 'Call the dentist',
  priority: 'high',
  estimatedDuration: 15,
  dueDate: '2026-11-01',
  category: 'Health',
  subtasks: ['Find insurance card'],
  notes: null,
  completedAt: null,
  createdAt: '2026-10-27T17:00:00.000Z',
}

function context(taskId: string) {
  return { params: Promise.resolve({ id: taskId }) }
}

function patch(body: unknown, taskId = id): Promise<Response> {
  return PATCH(
    new Request(`http://localhost/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    context(taskId)
  )
}

function del(taskId = id): Promise<Response> {
  return DELETE(
    new Request(`http://localhost/api/tasks/${taskId}`, { method: 'DELETE' }),
    context(taskId)
  )
}

function signIn(userId: string | null) {
  vi.mocked(auth).mockResolvedValue({ userId } as Awaited<ReturnType<typeof auth>>)
}

beforeEach(() => {
  vi.resetAllMocks()
  signIn('user_2abc')
})

describe('PATCH /api/tasks/[id]', () => {
  it('returns 401 when signed out', async () => {
    signIn(null)

    const response = await patch({ title: 'New title' })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(updateTask).not.toHaveBeenCalled()
  })

  it('returns 400 for an id that is not a UUID', async () => {
    const response = await patch({ title: 'New title' }, 'abc')

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: expect.any(String) })
    expect(updateTask).not.toHaveBeenCalled()
  })

  it.each([
    ['a body that is not JSON', 'not json'],
    ['an empty title', { title: '  ' }],
    ['an unknown priority', { priority: 'someday' }],
    ['a fractional estimatedDuration', { estimatedDuration: 7.5 }],
    ['a dueDate that is not a calendar date', { dueDate: '2026-02-30' }],
    ['a completed flag that is not a boolean', { completed: 'yes' }],
    ['a completedAt set by the client', { completedAt: '2026-10-27T17:00:00.000Z' }],
    ['an unknown field', { complete: true }],
  ])('returns 400 for %s', async (_, body) => {
    const response = await patch(body)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: expect.any(String),
      issues: [expect.objectContaining({ message: expect.any(String) })],
    })
    expect(updateTask).not.toHaveBeenCalled()
  })

  it('updates the task and returns it', async () => {
    const updated = { ...task, title: 'Call the orthodontist', dueDate: null }
    vi.mocked(updateTask).mockResolvedValue(updated)

    const response = await patch({ title: ' Call the orthodontist ', dueDate: null })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ task: updated })
    expect(updateTask).toHaveBeenCalledWith(id, { title: 'Call the orthodontist', dueDate: null })
  })

  it('passes completion through as a flag', async () => {
    const completed = { ...task, completedAt: '2026-10-27T18:00:00.000Z' }
    vi.mocked(updateTask).mockResolvedValue(completed)

    const response = await patch({ completed: true })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ task: completed })
    expect(updateTask).toHaveBeenCalledWith(id, { completed: true })
  })

  it('returns 404 when no task matches', async () => {
    vi.mocked(updateTask).mockResolvedValue(null)

    const response = await patch({ completed: false })

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Task not found' })
  })

  it('returns 500 without database details when the update fails', async () => {
    const error = new Error('Failed to update task: permission denied for table tasks')
    vi.mocked(updateTask).mockRejectedValue(error)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await patch({ title: 'New title' })

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to update task' })
    expect(consoleError).toHaveBeenCalledWith(error)
  })
})

describe('DELETE /api/tasks/[id]', () => {
  it('returns 401 when signed out', async () => {
    signIn(null)

    const response = await del()

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(deleteTask).not.toHaveBeenCalled()
  })

  it('returns 400 for an id that is not a UUID', async () => {
    const response = await del('abc')

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: expect.any(String) })
    expect(deleteTask).not.toHaveBeenCalled()
  })

  it('deletes the task and returns 204 with no body', async () => {
    vi.mocked(deleteTask).mockResolvedValue(true)

    const response = await del()

    expect(response.status).toBe(204)
    expect(await response.text()).toBe('')
    expect(deleteTask).toHaveBeenCalledWith(id)
  })

  it('returns 404 when no task matches', async () => {
    vi.mocked(deleteTask).mockResolvedValue(false)

    const response = await del()

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Task not found' })
  })

  it('returns 500 without database details when the delete fails', async () => {
    const error = new Error('Failed to delete task: permission denied for table tasks')
    vi.mocked(deleteTask).mockRejectedValue(error)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await del()

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to delete task' })
    expect(consoleError).toHaveBeenCalledWith(error)
  })
})
