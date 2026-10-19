import { describe, expect, it, vi } from 'vitest'
import { formatDueDate, isValidTimeZone, toIsoDate, todayIn } from '@/lib/dates'

describe('formatDueDate', () => {
  it('labels today and tomorrow using local day boundaries', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-02T10:00:00-08:00'))

    expect(formatDueDate('2026-03-02')).toBe('Today · Mar 2')
    expect(formatDueDate('2026-03-03')).toBe('Tomorrow · Mar 3')

    vi.useRealTimers()
  })

  it('labels dates within a week', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-02T10:00:00-08:00'))

    expect(formatDueDate('2026-03-04')).toBe('In 2 days · Mar 4')
    expect(formatDueDate('2026-03-09')).toBe('In 7 days · Mar 9')

    vi.useRealTimers()
  })

  it('does not shift date-only strings when local time is behind UTC', () => {
    // 6pm Pacific on Oct 19 is already Oct 20 in UTC.
    const now = new Date('2026-10-19T18:00:00-07:00')

    expect(formatDueDate('2026-10-19', now)).toBe('Today · Oct 19')
    expect(formatDueDate('2026-10-20', now)).toBe('Tomorrow · Oct 20')
  })

  it('counts calendar days across a DST change', () => {
    // US DST starts Mar 8, 2026.
    const now = new Date('2026-03-07T22:00:00-08:00')

    expect(formatDueDate('2026-03-09', now)).toBe('In 2 days · Mar 9')
  })
})

describe('todayIn', () => {
  it('returns the calendar date in the given time zone', () => {
    const now = new Date('2026-10-20T01:00:00Z')

    expect(todayIn('America/Los_Angeles', now)).toBe('2026-10-19')
    expect(todayIn('UTC', now)).toBe('2026-10-20')
    expect(todayIn('Pacific/Auckland', now)).toBe('2026-10-20')
  })

  it('defaults to the local time zone', () => {
    expect(todayIn(undefined, new Date('2026-10-20T01:00:00Z'))).toBe('2026-10-19')
  })
})

describe('toIsoDate', () => {
  it('keeps calendar dates and the date part of datetimes', () => {
    expect(toIsoDate('2026-10-20')).toBe('2026-10-20')
    expect(toIsoDate('2026-10-20T17:00:00Z')).toBe('2026-10-20')
  })

  it('returns null for missing or invalid dates', () => {
    expect(toIsoDate(null)).toBeNull()
    expect(toIsoDate(undefined)).toBeNull()
    expect(toIsoDate('next Friday')).toBeNull()
    expect(toIsoDate('2026-02-30')).toBeNull()
    expect(toIsoDate('10/20/2026')).toBeNull()
  })
})

describe('isValidTimeZone', () => {
  it('accepts IANA zones and rejects anything else', () => {
    expect(isValidTimeZone('America/Los_Angeles')).toBe(true)
    expect(isValidTimeZone('Not/AZone')).toBe(false)
  })
})
