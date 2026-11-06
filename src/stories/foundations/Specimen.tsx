import { useEffect, useRef, useState, type ReactNode } from 'react'

// Shared layout for the Foundations pages: a titled page, and a specimen row that prints the
// computed font metrics of whatever it renders.

export function FoundationsPage({
  title,
  intro,
  children,
}: {
  title: string
  intro: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-12 p-8">
      <header className="space-y-2">
        <h1 className="text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{intro}</p>
      </header>
      {children}
    </div>
  )
}

const FONT_NAMES: Record<string, string> = {
  '--font-geist-sans': 'Geist',
  '--font-geist-mono': 'Geist Mono',
  '--font-cormorant-garamond': 'Cormorant Garamond',
  '--font-fraunces': 'Fraunces',
}

// next/font renames families ("__Geist_abc123"); map them back to readable names.
function familyName(fontFamily: string): string {
  const first = fontFamily.split(',')[0].replaceAll(/["']/g, '').trim()
  for (const [variable, name] of Object.entries(FONT_NAMES)) {
    const resolved = getComputedStyle(document.body).getPropertyValue(variable).split(',')[0]
    if (resolved.replaceAll(/["']/g, '').trim() === first) return name
  }
  return first
}

function readMetrics(element: HTMLElement) {
  const style = getComputedStyle(element)
  const size = parseFloat(style.fontSize)
  const lineHeight = style.lineHeight === 'normal' ? 'normal' : `${parseFloat(style.lineHeight)}px`
  return [
    familyName(style.fontFamily),
    `${size}px (${size / 16}rem)`,
    `line ${lineHeight}`,
    `weight ${style.fontWeight}`,
    style.fontStyle === 'italic' ? 'italic' : null,
    style.letterSpacing === 'normal' ? null : `tracking ${style.letterSpacing}`,
  ]
    .filter(Boolean)
    .join(' · ')
}

export function Specimen({
  label,
  source,
  unused,
  children,
}: {
  label: string
  source: string
  unused?: boolean
  children: ReactNode
}) {
  const sampleRef = useRef<HTMLDivElement>(null)
  const [metrics, setMetrics] = useState('')

  useEffect(() => {
    const marked = sampleRef.current?.querySelector<HTMLElement>('[data-measure]')
    if (!marked) return
    // A wrapped component (SectionHeader) is measured by its heading, not its wrapper.
    const target = marked.querySelector<HTMLElement>('h1, h2, h3') ?? marked
    // Wait for web fonts, or the fallback font's metrics would be read.
    void document.fonts.ready.then(() => setMetrics(readMetrics(target)))
  }, [])

  return (
    <div className="grid gap-3 border-b border-border py-6 md:grid-cols-[16rem_1fr] md:gap-8">
      <div className="space-y-1 text-sm">
        <p className="font-medium">
          {label}
          {unused ? <span className="text-muted-foreground"> · unused</span> : null}
        </p>
        <p className="font-mono text-xs text-muted-foreground">{source}</p>
        <p className="font-mono text-xs text-muted-foreground">{metrics}</p>
      </div>
      <div ref={sampleRef} className="min-w-0">
        {children}
      </div>
    </div>
  )
}
