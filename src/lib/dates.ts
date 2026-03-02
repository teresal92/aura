export function formatDueDate(dateStr: string, now: Date = new Date()): string {
  const date = new Date(dateStr)
  const dayMs = 1000 * 60 * 60 * 24
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((dateStart.getTime() - nowStart.getTime()) / dayMs)

  if (days <= 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days <= 7) return `In ${days} days`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
