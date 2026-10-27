import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@/lib/supabase/server'
import { updateTask } from '@/lib/tasks/repository'
import type { Tables } from '@/types/database'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

const id = '6f1c2b8e-0d3a-4c6f-9a51-2b7e8d4f0a13'

const row: Tables<'tasks'> = {
  id,
  user_id: 'user_2abc',
  seq: 1,
  title: 'Call the dentist',
  priority: 'high',
  estimated_duration: 15,
  due_date: '2026-11-01',
  category: 'Health',
  subtasks: [],
  notes: null,
  completed_at: null,
  created_at: '2026-10-27T17:00:00+00:00',
}

interface Sent {
  method: string
  url: URL
  body: unknown
}

// A real supabase-js client whose fetch answers each request with the next queued rows, so the
// tests check the PostgREST requests updateTask actually sends.
function fakeDatabase(...responses: Tables<'tasks'>[][]) {
  const sent: Sent[] = []
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    const text = await request.text()
    sent.push({ method: request.method, url: new URL(request.url), body: text && JSON.parse(text) })
    const rows = responses.shift() ?? []
    // maybeSingle asks for one object; PostgREST answers 406 when no row matches.
    const wantsObject = request.headers.get('Accept') === 'application/vnd.pgrst.object+json'
    return wantsObject
      ? Response.json(rows[0] ?? { code: 'PGRST116', message: 'no rows' }, {
          status: rows[0] ? 200 : 406,
        })
      : Response.json(rows)
  })
  vi.mocked(createClient).mockReturnValue(
    createSupabaseClient('http://db.test', 'key', { global: { fetch } })
  )
  return sent
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('updateTask', () => {
  it('stamps completed_at only while the task is incomplete', async () => {
    const completed = { ...row, completed_at: '2026-10-27T18:00:00+00:00' }
    const sent = fakeDatabase([completed])

    const task = await updateTask(id, { completed: true })

    expect(task?.completedAt).toBe('2026-10-27T18:00:00.000Z')
    expect(sent).toHaveLength(1)
    expect(sent[0].method).toBe('PATCH')
    expect(sent[0].url.searchParams.get('completed_at')).toBe('is.null')
    expect(sent[0].body).toEqual({ completed_at: expect.any(String) })
  })

  it('keeps the original completedAt when the task is already complete', async () => {
    const completed = { ...row, completed_at: '2026-10-27T09:00:00+00:00' }
    const sent = fakeDatabase([], [completed])

    const task = await updateTask(id, { completed: true })

    expect(task?.completedAt).toBe('2026-10-27T09:00:00.000Z')
    expect(sent).toHaveLength(2)
    expect(sent[1].method).toBe('GET')
  })

  it('applies the rest of the patch to an already-complete task without restamping', async () => {
    const renamed = {
      ...row,
      title: 'Call the orthodontist',
      completed_at: '2026-10-27T09:00:00+00:00',
    }
    const sent = fakeDatabase([], [renamed])

    await updateTask(id, { title: 'Call the orthodontist', completed: true })

    expect(sent[1].method).toBe('PATCH')
    expect(sent[1].url.searchParams.has('completed_at')).toBe(false)
    expect(sent[1].body).toEqual({ title: 'Call the orthodontist' })
  })

  it('clears completed_at when uncompleted', async () => {
    const sent = fakeDatabase([row])

    await updateTask(id, { completed: false })

    expect(sent).toHaveLength(1)
    expect(sent[0].body).toEqual({ completed_at: null })
    expect(sent[0].url.searchParams.has('completed_at')).toBe(false)
  })

  it('returns null when no task matches', async () => {
    fakeDatabase([], [])

    expect(await updateTask(id, { completed: true })).toBeNull()
  })
})
