import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { cn } from '@/lib/utils'
import { FoundationsPage } from './Specimen'

// Radius, elevation, motion and layout as defined in globals.css, next to what the live app
// actually does with them.

const RADII = [
  { name: 'rounded-none', usedBy: 'Every button (base style), Clerk, task frames' },
  { name: 'rounded-sm', usedBy: '' },
  { name: 'rounded-md', usedBy: '' },
  { name: 'rounded-lg', usedBy: '' },
  { name: 'rounded-xl', usedBy: '' },
  { name: 'rounded-2xl', usedBy: '' },
  { name: 'rounded-full', usedBy: 'Priority dots, spinners' },
]

const SHADOWS = [
  { name: 'aura-shadow-xs', usedBy: '' },
  { name: 'aura-shadow-sm', usedBy: '' },
  { name: 'aura-shadow-md', usedBy: '' },
  { name: 'aura-shadow-lg', usedBy: '"Organizing" overlay card' },
]

const MOTION = [
  {
    label: '--aura-duration-fast · 150ms',
    className: 'duration-150',
    usedBy: 'Button hovers (base style), focus ring, textarea focus border',
  },
  {
    label: '--aura-duration-base · 250ms',
    className: 'duration-250',
    usedBy: 'Writing-focus dimming, overlay fade, completed-task fade. Hardcoded as duration-250',
  },
]

const LAYOUT = [
  { name: 'Page column', value: 'max-w-3xl (48rem)', source: 'page.tsx' },
  { name: 'Page gutters', value: 'px-4 / sm:px-6 / lg:px-8', source: 'page.tsx' },
  { name: 'Header → headline', value: 'pt-16 / sm:pt-24', source: 'page.tsx' },
  { name: 'Headline → input', value: 'mb-16', source: 'page.tsx' },
  { name: 'Input → list', value: 'mt-16 + pt-12, ruled', source: 'page.tsx' },
  { name: 'Between cards', value: 'space-y-4', source: 'TaskList' },
  { name: 'Card padding', value: 'p-6', source: 'TaskCard' },
  { name: 'Textarea frame padding', value: 'p-4 / sm:p-6', source: 'TaskInput' },
  { name: 'Textarea height', value: '216px → 360px, grows with text', source: 'TaskInput' },
]

function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

function MotionDemo({ label, className, usedBy }: (typeof MOTION)[number]) {
  const [on, setOn] = useState(false)
  return (
    <div className="flex flex-wrap items-center gap-6 border-b border-border py-6">
      <button type="button" onClick={() => setOn((v) => !v)} className="aura-focus-ring">
        Play
      </button>
      <div className="w-56 border border-border p-1">
        <div
          className={cn(
            'size-8 bg-foreground transition-transform ease-(--aura-ease-out)',
            className,
            on ? 'translate-x-44' : 'translate-x-0'
          )}
        />
      </div>
      <div className="space-y-1">
        <p className="font-mono text-xs">{label}</p>
        <Note>{usedBy}</Note>
      </div>
    </div>
  )
}

function ShapeAndMotionPage() {
  return (
    <FoundationsPage
      title="Shape, elevation & motion"
      intro="The tokens describe a rounded, shadowed UI. The live app is square and flat: one shadow, and radius only on dots and spinners."
    >
      <section className="space-y-4">
        <h2>Radius</h2>
        <Note>--radius is 1.25rem; the scale derives from it.</Note>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {RADII.map((radius) => (
            <div key={radius.name} className="space-y-2">
              <div className={cn('h-20 border border-foreground', radius.name)} />
              <p className="font-mono text-xs">{radius.name}</p>
              <Note>{radius.usedBy || 'Unused in the live app'}</Note>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2>Elevation</h2>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {SHADOWS.map((shadow) => (
            <div key={shadow.name} className="space-y-3">
              <div className={cn('h-24 bg-background', shadow.name)} />
              <p className="font-mono text-xs">.{shadow.name}</p>
              <Note>{shadow.usedBy || 'Unused in the live app'}</Note>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2>Motion</h2>
        <Note>
          Easing: --aura-ease-out, cubic-bezier(0.22, 1, 0.36, 1). Components mostly use
          Tailwind&apos;s ease-out instead.
        </Note>
        {MOTION.map((motion) => (
          <MotionDemo key={motion.label} {...motion} />
        ))}
      </section>

      <section className="space-y-4">
        <h2>Layout and spacing</h2>
        <Note>No spacing or layout tokens; these are the values the page uses.</Note>
        <table className="w-full border-collapse text-left text-sm">
          <tbody>
            {LAYOUT.map((row) => (
              <tr key={row.name} className="border-b border-border">
                <td className="py-3 pr-4">{row.name}</td>
                <td className="py-3 pr-4 font-mono text-xs">{row.value}</td>
                <td className="py-3 text-muted-foreground">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </FoundationsPage>
  )
}

const meta = {
  title: 'Foundations/Shape, elevation & motion',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

export const Overview: StoryObj = {
  render: () => <ShapeAndMotionPage />,
}
