'use client'

import { useEffect, useRef, useState } from 'react'

type Swatch = { bg: string; fg: string; note?: string }

// Surface tokens shown with the text token meant to sit on them.
const pairs: Swatch[] = [
  { bg: 'background', fg: 'foreground' },
  { bg: 'background', fg: 'muted-foreground' },
  { bg: 'card', fg: 'card-foreground' },
  { bg: 'popover', fg: 'popover-foreground' },
  { bg: 'surface', fg: 'foreground' },
  { bg: 'primary', fg: 'primary-foreground' },
  { bg: 'secondary', fg: 'secondary-foreground' },
  { bg: 'muted', fg: 'muted-foreground' },
  { bg: 'accent', fg: 'accent-foreground' },
  { bg: 'destructive', fg: 'destructive-foreground' },
]

// Line/accent tokens, measured against the page background.
const strokes: Swatch[] = [
  { bg: 'background', fg: 'border', note: 'dividers' },
  { bg: 'background', fg: 'input', note: 'field borders' },
  { bg: 'background', fg: 'ring', note: 'focus ring' },
  { bg: 'background', fg: 'flag', note: 'follow-up flags' },
  { bg: 'background', fg: 'destructive', note: 'as text' },
]

let canvasCtx: CanvasRenderingContext2D | null = null

// Paints colors onto a 1px canvas so any CSS color (oklch, color-mix, alpha) resolves to sRGB.
function paint(...colors: string[]): [number, number, number] {
  canvasCtx ??= Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext(
    '2d',
    { willReadFrequently: true }
  )
  const ctx = canvasCtx!
  ctx.clearRect(0, 0, 1, 1)
  for (const color of colors) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
  }
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

function luminance([r, g, b]: [number, number, number]) {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function toHex(rgb: [number, number, number]) {
  return `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

type Measurement = { bgHex: string; fgHex: string; ratio: number; raw: string }

function useMeasure(swatch: Swatch) {
  const ref = useRef<HTMLDivElement>(null)
  const [measurement, setMeasurement] = useState<Measurement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const style = getComputedStyle(el)
    const bg = style.backgroundColor
    const fg = style.color
    const bgRgb = paint('white', bg)
    const fgRgb = paint('white', bg, fg)
    const [hi, lo] = [luminance(bgRgb), luminance(fgRgb)].sort((a, b) => b - a)
    setMeasurement({
      bgHex: toHex(bgRgb),
      fgHex: toHex(fgRgb),
      ratio: (hi + 0.05) / (lo + 0.05),
      raw: style.getPropertyValue(`--${swatch.fg}`).trim(),
    })
  }, [swatch.fg])

  return { ref, measurement }
}

function Rating({ ratio }: { ratio: number }) {
  const label = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA large' : 'Fail'
  return (
    <span className="font-mono text-xs tabular-nums">
      {ratio.toFixed(2)}:1{' '}
      <span className={ratio < 3 ? 'text-destructive' : 'text-muted-foreground'}>{label}</span>
    </span>
  )
}

function PairSwatch({ swatch }: { swatch: Swatch }) {
  const { ref, measurement } = useMeasure(swatch)
  return (
    <div className="flex items-stretch gap-3">
      <div
        ref={ref}
        className="flex w-20 shrink-0 items-center justify-center border border-border text-2xl"
        style={{ backgroundColor: `var(--${swatch.bg})`, color: `var(--${swatch.fg})` }}
      >
        Aa
      </div>
      <div className="min-w-0 py-1">
        <p className="text-sm font-medium">
          {swatch.fg} <span className="text-muted-foreground">on</span> {swatch.bg}
        </p>
        {measurement ? (
          <>
            <p className="font-mono text-xs text-muted-foreground">
              {measurement.fgHex} / {measurement.bgHex}
            </p>
            <Rating ratio={measurement.ratio} />
          </>
        ) : null}
      </div>
    </div>
  )
}

function StrokeSwatch({ swatch }: { swatch: Swatch }) {
  const { ref, measurement } = useMeasure(swatch)
  return (
    <div className="flex items-center gap-3">
      <div
        ref={ref}
        className="size-12 shrink-0 border-4"
        style={{
          backgroundColor: `var(--${swatch.bg})`,
          color: `var(--${swatch.fg})`,
          borderColor: 'currentColor',
        }}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {swatch.fg} <span className="text-muted-foreground">· {swatch.note}</span>
        </p>
        {measurement ? (
          <p className="truncate font-mono text-xs text-muted-foreground">
            {measurement.fgHex} · {measurement.raw}
          </p>
        ) : null}
        {measurement ? <Rating ratio={measurement.ratio} /> : null}
      </div>
    </div>
  )
}

export function ThemePanel({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div className="h-full border border-border bg-background p-6 text-foreground">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {theme === 'light' ? ':root' : '.dark'}
      </p>
      <div className="mt-4 space-y-4">
        {pairs.map((swatch) => (
          <PairSwatch key={`${swatch.bg}-${swatch.fg}`} swatch={swatch} />
        ))}
      </div>
      <p className="mt-8 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Lines &amp; accents
      </p>
      <div className="mt-4 space-y-4">
        {strokes.map((swatch) => (
          <StrokeSwatch key={swatch.fg} swatch={swatch} />
        ))}
      </div>
    </div>
  )
}
