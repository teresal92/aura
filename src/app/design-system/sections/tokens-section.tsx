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

const EXPLORATION_PALETTE: ReadonlyArray<{
  label: string
  name: string
  value: string
  token: string
  mapping?: string
}> = [
  {
    label: 'Base',
    name: 'Parchment',
    value: 'var(--aura-base)',
    token: '--aura-base',
    mapping: '--background',
  },
  {
    label: 'Primary Text',
    name: 'Charcoal',
    value: 'var(--aura-charcoal)',
    token: '--aura-charcoal',
    mapping: '--foreground, --primary',
  },
  {
    label: 'Accent 1',
    name: 'Moss',
    value: 'var(--aura-moss)',
    token: '--aura-moss',
  },
  {
    label: 'Accent 2',
    name: 'Washed Navy',
    value: 'var(--aura-washed-navy)',
    token: '--aura-washed-navy',
  },
  {
    label: 'Accent 3',
    name: 'Cedar Brown',
    value: 'var(--aura-cedar)',
    token: '--aura-cedar',
  },
]

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
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">Palette Exploration</p>
          <p className="text-xs text-muted-foreground">
            Base and charcoal now drive the light theme core tokens, while the accent swatches are
            available as named Aura colors for iteration.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {EXPLORATION_PALETTE.map(({ label, name, value, token, mapping }) => (
            <div key={token} className="space-y-2">
              <div className="h-12 rounded-xl border border-border" style={{ background: value }} />
              <div>
                <p className="text-xs font-medium">{label}</p>
                <p className="text-xs font-medium">{name}</p>
                <p className="text-[10px] text-muted-foreground">{token}</p>
                {mapping ? (
                  <p className="text-[10px] text-muted-foreground">Maps to {mapping}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
