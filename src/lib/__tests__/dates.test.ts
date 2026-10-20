import { describe, expect, it } from 'vitest'
import { formatDueDate, isValidTimeZone, toIsoDate, todayIn } from '@/lib/dates'

describe('formatDueDate', () => {
  it('does not shift date-only strings when local time is behind UTC', () => {
    // 6pm Pacific on Oct 19 is already Oct 20 in UTC.
    const now = new Date('2026-10-19T18:00:00-07:00')

    expect(formatDueDate('2026-10-19', now)).toBe('Mon, Oct 19')
    expect(formatDueDate('2026-10-20', now)).toBe('Tue, Oct 20')
  })

  it('shows the year only when it differs from the current year', () => {
    // 6pm Pacific on Dec 31 is already Jan 1 in UTC.
    const now = new Date('2026-12-31T18:00:00-08:00')

    expect(formatDueDate('2026-12-31', now)).toBe('Thu, Dec 31')
    expect(formatDueDate('2027-01-01', now)).toBe('Fri, Jan 1, 2027')
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
