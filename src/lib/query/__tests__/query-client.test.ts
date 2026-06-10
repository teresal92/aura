import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.resetModules()
})

describe('getQueryClient', () => {
  it('returns the same instance on repeated client-side calls', async () => {
    vi.doMock('@tanstack/react-query', async () => {
      const actual = await vi.importActual('@tanstack/react-query')
      return { ...actual, environmentManager: { isServer: () => false } }
    })

    const { default: getQueryClient } = await import('../query-client')
    expect(getQueryClient()).toBe(getQueryClient())
  })

  it('returns a fresh instance on each server-side call', async () => {
    vi.doMock('@tanstack/react-query', async () => {
      const actual = await vi.importActual('@tanstack/react-query')
      return { ...actual, environmentManager: { isServer: () => true } }
    })

    const { default: getQueryClient } = await import('../query-client')
    expect(getQueryClient()).not.toBe(getQueryClient())
  })
})
