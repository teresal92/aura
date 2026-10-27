// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { ClearQueryCacheOnSignOut } from '@/app/providers'
import { taskKeys } from '@/lib/query/keys'

const auth = vi.hoisted(() => ({ isLoaded: true, isSignedIn: true }))

vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => auth,
}))

describe('ClearQueryCacheOnSignOut', () => {
  it('clears cached tasks once the user signs out', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(taskKeys.user('user_1'), [])
    const ui = () => (
      <QueryClientProvider client={queryClient}>
        <ClearQueryCacheOnSignOut />
      </QueryClientProvider>
    )

    const { rerender } = render(ui())
    expect(queryClient.getQueryData(taskKeys.user('user_1'))).toEqual([])

    auth.isSignedIn = false
    rerender(ui())
    expect(queryClient.getQueryData(taskKeys.user('user_1'))).toBeUndefined()
  })
})
