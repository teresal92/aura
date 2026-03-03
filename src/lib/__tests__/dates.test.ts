import { describe, expect, it, vi } from 'vitest'
import { formatDueDate } from '@/lib/dates'

describe('formatDueDate', () => {
  it('labels today and tomorrow using local day boundaries', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-02T10:00:00-08:00'))

    expect(formatDueDate('2026-03-02T23:59:59-08:00')).toBe('Today')
    expect(formatDueDate('2026-03-03T00:00:01-08:00')).toBe('Tomorrow')

    vi.useRealTimers()
  })

  it('labels dates within a week', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-02T10:00:00-08:00'))

    expect(formatDueDate('2026-03-04T12:00:00-08:00')).toBe('In 2 days')
    expect(formatDueDate('2026-03-09T12:00:00-08:00')).toBe('In 7 days')

    vi.useRealTimers()
  })
})
