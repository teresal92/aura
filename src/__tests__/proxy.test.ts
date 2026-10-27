import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'
import proxy from '@/proxy'

// Expose the handler passed to clerkMiddleware; keep the real route matcher so its pattern is
// tested too.
vi.mock('@clerk/nextjs/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@clerk/nextjs/server')>()),
  clerkMiddleware: (handler: unknown) => handler,
}))

type Handler = (auth: () => Promise<{ userId: string | null }>, req: NextRequest) => unknown

function run(path: string, userId: string | null) {
  const handler = proxy as unknown as Handler
  return handler(async () => ({ userId }), new NextRequest(`http://localhost${path}`))
}

describe('proxy', () => {
  it('answers a signed-out API request with 401', async () => {
    const response = (await run('/api/tasks', null)) as Response

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('lets a signed-in API request through', async () => {
    expect(await run('/api/tasks', 'user_2abc')).toBeUndefined()
  })

  it('lets a signed-out page request through', async () => {
    expect(await run('/', null)).toBeUndefined()
  })
})
