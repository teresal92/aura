import type { IsoDate } from '@/types/task'

// Due dates are calendar dates ("YYYY-MM-DD"), not instants. Never pass them to `new Date(str)`:
// date-only strings parse as UTC midnight and shift a day in zones west of UTC.

// The en-CA locale formats dates as YYYY-MM-DD.
export function todayIn(timeZone?: string, now: Date = new Date()): IsoDate {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(now)
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
    return true
  } catch {
    return false
  }
}

// Normalizes model output to "YYYY-MM-DD", or null if it isn't a real calendar date. A datetime
// keeps its written date ("2026-10-20T17:00:00Z" → "2026-10-20"); any time is dropped.
export function toIsoDate(value: string | null | undefined): IsoDate | null {
  const match = value?.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/)
  if (!match) return null
  const [, year, month, day] = match.map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return `${match[1]}-${match[2]}-${match[3]}`
}

function parseIsoDate(dateStr: IsoDate): Date {
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDueDate(dateStr: IsoDate, now: Date = new Date()): string {
  const date = parseIsoDate(dateStr)
  const dayMs = 1000 * 60 * 60 * 24
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((date.getTime() - nowStart.getTime()) / dayMs)
  const abs = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (days <= 0) return `Today · ${abs}`
  if (days === 1) return `Tomorrow · ${abs}`
  if (days <= 7) return `In ${days} days · ${abs}`
  return abs
}
