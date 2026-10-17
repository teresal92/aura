import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ThemePanel } from './theme-panel'

export const metadata: Metadata = {
  title: 'Design tokens · Aura',
}

const radii = [
  'rounded-sm',
  'rounded-md',
  'rounded-lg',
  'rounded-xl',
  'rounded-2xl',
  'rounded-full',
]
const shadows = ['aura-shadow-xs', 'aura-shadow-sm', 'aura-shadow-md', 'aura-shadow-lg']
const fonts = [
  { className: 'font-sans', label: 'font-sans · Geist' },
  { className: 'font-heading', label: 'font-heading / font-serif · Cormorant Garamond' },
  { className: 'font-display', label: 'font-display · Fraunces' },
  { className: 'font-mono', label: 'font-mono · Geist Mono' },
]

// Dev-only reference page for the tokens defined in globals.css.
export default function DesignPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-border pb-6">
          <p className="font-display text-3xl">aura</p>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Design tokens · source of truth: src/app/globals.css
          </p>
        </header>

        <section className="mt-12">
          <h2>Color</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Contrast is measured live against each token&apos;s paired surface. AA needs 4.5:1 for
            body text, 3:1 for large text and UI.
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ThemePanel theme="light" />
            <div className="dark">
              <ThemePanel theme="dark" />
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2>Typography</h2>
          <div className="mt-6 space-y-6">
            {fonts.map((font) => (
              <div key={font.className} className="border-b border-border pb-4">
                <p className="font-mono text-xs text-muted-foreground">{font.label}</p>
                <p className={`${font.className} mt-1 text-3xl`}>Just start typing. 0123456789</p>
              </div>
            ))}
            <div className="space-y-3">
              <h1>h1 headline</h1>
              <h2>h2 section heading</h2>
              <h3>h3 subheading</h3>
              <p>Body text in Geist Sans, the default for paragraphs.</p>
              <p className="aura-text-typewriter">aura-text-typewriter — brain dump input</p>
              <p className="aura-text-micro text-muted-foreground">aura-text-micro — 10px</p>
              <span className="aura-badge bg-secondary">aura-badge</span>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2>Radius</h2>
          <p className="mt-2 text-sm text-muted-foreground">Base --radius: 1.25rem</p>
          <div className="mt-6 flex flex-wrap gap-6">
            {radii.map((radius) => (
              <div key={radius} className="text-center">
                <div className={`${radius} size-20 border border-foreground bg-secondary`} />
                <p className="mt-2 font-mono text-xs text-muted-foreground">{radius}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2>Elevation</h2>
          <div className="mt-6 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {shadows.map((shadow) => (
              <div key={shadow} className={`${shadow} flex h-24 items-end bg-surface p-3`}>
                <p className="font-mono text-xs text-muted-foreground">{shadow}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2>Buttons &amp; focus</h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button">Default button</button>
            <button type="button" className="aura-btn-primary">
              aura-btn-primary
            </button>
            <button type="button" disabled>
              Disabled
            </button>
            <input
              className="aura-focus-ring border border-input bg-transparent px-3 py-1.5"
              placeholder="aura-focus-ring (tab here)"
            />
          </div>
        </section>

        <section className="mt-16">
          <h2>Motion</h2>
          <dl className="mt-6 grid gap-2 font-mono text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">--aura-ease-out</dt>
              <dd>cubic-bezier(0.22, 1, 0.36, 1)</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">--aura-duration-fast</dt>
              <dd>150ms</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">--aura-duration-base</dt>
              <dd>250ms</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  )
}
