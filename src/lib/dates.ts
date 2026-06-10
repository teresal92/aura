export function formatDueDate(dateStr: string, now: Date = new Date()): string {
  const date = new Date(dateStr)
  const dayMs = 1000 * 60 * 60 * 24
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((dateStart.getTime() - nowStart.getTime()) / dayMs)
  const abs = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (days <= 0) return `Today · ${abs}`
  if (days === 1) return `Tomorrow · ${abs}`
  if (days <= 7) return `In ${days} days · ${abs}`
  return abs
}
