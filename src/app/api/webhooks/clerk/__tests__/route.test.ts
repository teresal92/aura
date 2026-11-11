import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/webhooks/clerk/route'
import { deleteUserTasks } from '@/lib/tasks/delete-user-tasks'

vi.mock('@clerk/nextjs/webhooks', () => ({ verifyWebhook: vi.fn() }))
vi.mock('@/lib/tasks/delete-user-tasks', () => ({ deleteUserTasks: vi.fn() }))

type WebhookEvent = Awaited<ReturnType<typeof verifyWebhook>>

function deliver(event: unknown) {
  vi.mocked(verifyWebhook).mockResolvedValue(event as WebhookEvent)
  return POST(
    new NextRequest('http://localhost/api/webhooks/clerk', { method: 'POST', body: '{}' })
  )
}

const userDeleted = (id?: string) => ({
  type: 'user.deleted',
  object: 'event',
  data: { object: 'user', id, deleted: true },
})

describe('POST /api/webhooks/clerk', () => {
  let consoleError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.resetAllMocks()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns 400 and deletes nothing when the signature is invalid', async () => {
    vi.mocked(verifyWebhook).mockRejectedValue(new Error('No matching signature found'))

    const response = await POST(
      new NextRequest('http://localhost/api/webhooks/clerk', { method: 'POST', body: '{}' })
    )

    expect(response.status).toBe(400)
    expect(deleteUserTasks).not.toHaveBeenCalled()
  })

  it("deletes the user's tasks on user.deleted and returns 200", async () => {
    const response = await deliver(userDeleted('user_2abc'))

    expect(response.status).toBe(200)
    expect(deleteUserTasks).toHaveBeenCalledExactlyOnceWith('user_2abc')
  })

  it('succeeds on a repeat delivery of the same user.deleted', async () => {
    expect((await deliver(userDeleted('user_2abc'))).status).toBe(200)
    expect((await deliver(userDeleted('user_2abc'))).status).toBe(200)
  })

  it('returns 400 and deletes nothing when user.deleted has no user ID', async () => {
    const response = await deliver(userDeleted(undefined))

    expect(response.status).toBe(400)
    expect(deleteUserTasks).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalled()
  })

  it.each(['user.created', 'user.updated', 'session.created'])(
    'ignores %s with 200',
    async (type) => {
      const response = await deliver({ type, object: 'event', data: { id: 'user_2abc' } })

      expect(response.status).toBe(200)
      expect(deleteUserTasks).not.toHaveBeenCalled()
    }
  )

  it('returns 500 without database details when the delete fails, so Clerk retries', async () => {
    const error = new Error('Failed to delete tasks for user_2abc: connection refused')
    vi.mocked(deleteUserTasks).mockRejectedValue(error)

    const response = await deliver(userDeleted('user_2abc'))

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to delete tasks' })
    expect(consoleError).toHaveBeenCalledWith(error)
  })
})
