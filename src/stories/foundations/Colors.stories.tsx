import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { contrast, resolveColor, toHex, type Rgba } from './color'
import { FoundationsPage } from './Specimen'

// Reads the color tokens from globals.css as the browser resolves them, so this page always
// shows the real values for the current theme (toolbar → Theme).

type Usage = 'core' | 'rare' | 'unused'

const TOKENS: { name: string; usage: Usage; note: string }[] = [
  { name: 'background', usage: 'core', note: 'Page, inputs, overlay card' },
  { name: 'foreground', usage: 'core', note: 'Text, borders of controls, primary button fill' },
  { name: 'muted-foreground', usage: 'core', note: 'Meta text, placeholders, priority dots' },
  { name: 'border', usage: 'core', note: 'Hairline frames and rules' },
  { name: 'destructive', usage: 'core', note: 'Error text, delete hover' },
  { name: 'ring', usage: 'rare', note: 'Focus ring (.aura-focus-ring, base outline at 50%)' },
  { name: 'primary', usage: 'rare', note: 'Spinner arc and Clerk only; buttons use foreground' },
  { name: 'primary-foreground', usage: 'rare', note: 'Clerk only' },
  { name: 'secondary', usage: 'rare', note: 'IconButton "subtle" hover, a variant nothing uses' },
  { name: 'secondary-foreground', usage: 'unused', note: '' },
  { name: 'muted', usage: 'unused', note: '' },
  { name: 'accent', usage: 'unused', note: '' },
  { name: 'accent-foreground', usage: 'unused', note: '' },
  { name: 'card', usage: 'unused', note: 'Only the unused ui/Card and ui/Dialog' },
  { name: 'card-foreground', usage: 'unused', note: '' },
  { name: 'popover', usage: 'unused', note: 'Only the unused ui/Dropdown' },
  { name: 'popover-foreground', usage: 'unused', note: '' },
  { name: 'destructive-foreground', usage: 'unused', note: '' },
  { name: 'input', usage: 'unused', note: 'Only the unused ui/Input; the textarea uses border' },
]

type Requirement = 'text' | 'ui' | 'none'

const PAIRS: { fg: string; bg: string; requirement: Requirement; where: string }[] = [
  { fg: 'foreground', bg: 'background', requirement: 'text', where: 'Body text' },
  { fg: 'muted-foreground', bg: 'background', requirement: 'text', where: 'Meta text' },
  { fg: 'destructive', bg: 'background', requirement: 'text', where: 'Error messages' },
  { fg: 'background', bg: 'foreground', requirement: 'text', where: 'Primary button label' },
  { fg: 'border', bg: 'background', requirement: 'ui', where: 'Textarea and card frames' },
  { fg: 'foreground', bg: 'background', requirement: 'ui', where: 'Button and checkbox borders' },
  { fg: 'ring', bg: 'background', requirement: 'ui', where: '.aura-focus-ring' },
  {
    fg: 'color-mix(in oklab, var(--ring) 50%, transparent)',
    bg: 'background',
    requirement: 'ui',
    where: 'Browser outline on buttons without .aura-focus-ring',
  },
  { fg: 'muted-foreground', bg: 'muted', requirement: 'text', where: 'Unused in the app' },
  { fg: 'primary-foreground', bg: 'primary', requirement: 'text', where: 'Clerk primary button' },
]

const MINIMUM: Record<Requirement, number> = { text: 4.5, ui: 3, none: 0 }

function cssVar(name: string) {
  return name.includes('(') ? name : `var(--${name})`
}

function rawValue(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()
}

// Reads the DOM once on mount. The story remounts this page when the theme changes, after the
// theme decorator has set the `.dark` class.
function useResolved<T>(compute: () => T): T {
  const [value] = useState(compute)
  return value
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="block size-10 shrink-0 border border-foreground/20"
      style={{ background: color }}
    />
  )
}

function TokenTable() {
  const rows = useResolved(computeTokens)

  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead className="text-muted-foreground">
        <tr className="border-b border-border">
          <th className="py-2 pr-4 font-normal">Token</th>
          <th className="py-2 pr-4 font-normal">Value</th>
          <th className="py-2 pr-4 font-normal">Same value as</th>
          <th className="py-2 font-normal">Used in the live app</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name} className="border-b border-border align-top">
            <td className="py-3 pr-4">
              <div className="flex items-center gap-3">
                <Swatch color={cssVar(row.name)} />
                <code className="font-mono">--{row.name}</code>
              </div>
            </td>
            <td className="py-3 pr-4 font-mono text-xs">
              {row.raw}
              <br />
              <span className="text-muted-foreground">{row.hex}</span>
            </td>
            <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
              {row.sameAs.join(', ')}
            </td>
            <td className="py-3">
              <span className={row.usage === 'unused' ? 'text-muted-foreground' : undefined}>
                {row.usage === 'core' ? 'Yes' : row.usage === 'rare' ? 'Barely' : 'No'}
              </span>
              {row.note ? <span className="text-muted-foreground"> · {row.note}</span> : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function computeTokens() {
  const resolved = TOKENS.map((token) => ({
    ...token,
    raw: rawValue(token.name),
    hex: toHex(resolveColor(cssVar(token.name))),
  }))
  return resolved.map((token) => ({
    ...token,
    sameAs: resolved.filter((o) => o.name !== token.name && o.raw === token.raw).map((o) => o.name),
  }))
}

function ContrastTable() {
  const rows = useResolved(computeContrast)

  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead className="text-muted-foreground">
        <tr className="border-b border-border">
          <th className="py-2 pr-4 font-normal">Sample</th>
          <th className="py-2 pr-4 font-normal">Pair</th>
          <th className="py-2 pr-4 font-normal">Where</th>
          <th className="py-2 pr-4 font-normal">Ratio</th>
          <th className="py-2 font-normal">WCAG AA</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.fg}-${row.bg}-${row.where}`} className="border-b border-border">
            <td className="py-3 pr-4">
              <span
                className="inline-flex h-10 w-16 items-center justify-center border-2 text-base"
                style={{
                  background: cssVar(row.bg),
                  color: cssVar(row.fg),
                  borderColor: row.requirement === 'ui' ? cssVar(row.fg) : 'transparent',
                }}
              >
                Aa
              </span>
            </td>
            <td className="py-3 pr-4 font-mono text-xs">
              {row.fg.includes('(') ? 'ring @ 50%' : row.fg} on {row.bg}
            </td>
            <td className="py-3 pr-4 text-muted-foreground">{row.where}</td>
            <td className="py-3 pr-4 font-mono tabular-nums">{row.ratio.toFixed(2)}:1</td>
            <td className="py-3">
              {row.pass ? 'Pass' : <strong className="text-destructive">Fail</strong>}
              <span className="text-muted-foreground">
                {' '}
                ({row.requirement === 'text' ? 'text' : 'non-text'}, {MINIMUM[row.requirement]}:1)
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function computeContrast() {
  return PAIRS.map((pair) => {
    const bg: Rgba = resolveColor(cssVar(pair.bg))
    const ratio = contrast(resolveColor(cssVar(pair.fg)), bg)
    return { ...pair, ratio, pass: ratio >= MINIMUM[pair.requirement] }
  })
}

function ColorsPage() {
  return (
    <FoundationsPage
      title="Color"
      intro={
        <>
          The tokens in <code className="font-mono">src/app/globals.css</code>, resolved live for
          the current theme. The roles are shadcn&apos;s; the app uses about five of them.
        </>
      }
    >
      <section className="space-y-4">
        <h2>Tokens</h2>
        <TokenTable />
      </section>
      <section className="space-y-4">
        <h2>Contrast</h2>
        <ContrastTable />
      </section>
    </FoundationsPage>
  )
}

const meta = {
  title: 'Foundations/Color',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

export const Tokens: StoryObj = {
  // Remount on theme change so the values are read again.
  render: (_args, { globals }) => <ColorsPage key={globals.theme} />,
}
