import * as React from 'react'

const TOKENS = [
  ['Background', 'var(--background)'],
  ['Foreground', 'var(--foreground)'],
  ['Primary', 'var(--primary)'],
  ['Secondary', 'var(--secondary)'],
  ['Muted', 'var(--muted)'],
  ['Border', 'var(--border)'],
  ['Urgent', 'var(--aura-urgent)'],
  ['High', 'var(--aura-high)'],
  ['Medium', 'var(--aura-medium)'],
  ['Low', 'var(--aura-low)'],
] as const

export function TokensSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Tokens</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {TOKENS.map(([label, value]) => (
          <div key={label} className="space-y-2">
            <div className="h-12 rounded-xl border border-border" style={{ background: value }} />
            <div>
              <p className="text-xs font-medium">{label}</p>
              <p className="text-[10px] text-muted-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
