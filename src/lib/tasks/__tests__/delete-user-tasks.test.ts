import { createClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteUserTasks } from '@/lib/tasks/delete-user-tasks'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

// A real supabase-js client whose fetch records the request, so the test checks the PostgREST
// request actually sent. An unscoped delete here would wipe every user's tasks.
function fakeDatabase(response: Response) {
  const sent: { method: string; url: URL }[] = []
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    sent.push({ method: request.method, url: new URL(request.url) })
    return response
  })
  vi.mocked(createAdminClient).mockReturnValue(
    createClient('http://db.test', 'sb_secret_test', { global: { fetch } }) as ReturnType<
      typeof createAdminClient
    >
  )
  return sent
}

describe('deleteUserTasks', () => {
  beforeEach(() => vi.resetAllMocks())

  it("deletes only the given user's tasks", async () => {
    const sent = fakeDatabase(new Response(null, { status: 204 }))

    await deleteUserTasks('user_2abc')

    expect(sent).toHaveLength(1)
    expect(sent[0].method).toBe('DELETE')
    expect(sent[0].url.pathname).toBe('/rest/v1/tasks')
    expect([...sent[0].url.searchParams]).toEqual([['user_id', 'eq.user_2abc']])
  })

  it('refuses an empty user ID instead of sending a delete', async () => {
    const sent = fakeDatabase(new Response(null, { status: 204 }))

    await expect(deleteUserTasks('')).rejects.toThrow()
    expect(sent).toHaveLength(0)
  })

  it('throws when the database returns an error', async () => {
    fakeDatabase(
      Response.json(
        { message: 'permission denied for table tasks', code: '42501' },
        { status: 403 }
      )
    )

    await expect(deleteUserTasks('user_2abc')).rejects.toThrow(
      'Failed to delete tasks for user_2abc: permission denied for table tasks'
    )
  })
})
