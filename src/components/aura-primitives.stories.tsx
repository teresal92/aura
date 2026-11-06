import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  CategoryBadge,
  CompletionCheckbox,
  IconButton,
  MetaText,
  PriorityBadge,
  SectionHeader,
  type Priority,
} from '@/components/aura-primitives'

// The primitives the live app uses, plus the button styles that come from globals.css rather
// than a component.

const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low']

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-3 border-b border-border py-5 sm:grid-cols-[12rem_1fr]">
      <p className="font-mono text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-6">{children}</div>
    </div>
  )
}

const meta = {
  title: 'Current UI/Primitives',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Buttons: Story = {
  render: () => (
    <div className="max-w-3xl">
      <Row label="<button> (base style)">
        <button type="button">Sign in</button>
        <button type="button" disabled>
          Disabled
        </button>
      </Row>
      <Row label=".aura-btn-primary">
        <button type="button" className="aura-btn-primary">
          organize
        </button>
        <button type="button" className="aura-btn-primary" disabled>
          organize
        </button>
      </Row>
      <Row label="+ .aura-focus-ring">
        <button type="button" className="aura-focus-ring">
          Tab to me
        </button>
        <span className="text-sm text-muted-foreground">
          Most buttons in the app don&apos;t have this, so they show the browser outline.
        </span>
      </Row>
    </div>
  ),
}

export const IconButtons: Story = {
  name: 'IconButton',
  render: () => (
    <div className="max-w-3xl">
      {(['ghost', 'subtle', 'danger', 'success'] as const).map((variant) => (
        <Row key={variant} label={`variant="${variant}"`}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <IconButton key={size} size={size} variant={variant} aria-label={`Delete (${size})`}>
              <span aria-hidden="true" className="text-3xl leading-none">
                ×
              </span>
            </IconButton>
          ))}
          <span className="text-sm text-muted-foreground">sm 32px · md 36px · lg 40px</span>
        </Row>
      ))}
    </div>
  ),
}

export const Priorities: Story = {
  name: 'PriorityBadge',
  render: () => (
    <div className="max-w-3xl">
      <Row label="PriorityBadge">
        {PRIORITIES.map((priority) => (
          <PriorityBadge key={priority} priority={priority} />
        ))}
      </Row>
      <Row label="With meta, as on a card">
        <PriorityBadge priority="medium" />
        <MetaText>45m</MetaText>
        <CategoryBadge category="Health" />
        <span className="text-base italic text-muted-foreground">Tue, Nov 10</span>
      </Row>
    </div>
  ),
}

function CheckboxDemo() {
  const [checked, setChecked] = useState(false)
  return <CompletionCheckbox checked={checked} onChange={() => setChecked((v) => !v)} />
}

export const Checkbox: Story = {
  name: 'CompletionCheckbox',
  render: () => (
    <div className="max-w-3xl">
      <Row label="checked={false}">
        <CompletionCheckbox checked={false} onChange={() => {}} />
      </Row>
      <Row label="checked">
        <CompletionCheckbox checked onChange={() => {}} />
      </Row>
      <Row label="Interactive">
        <CheckboxDemo />
      </Row>
    </div>
  ),
}

export const Section: Story = {
  name: 'SectionHeader',
  render: () => (
    <div className="max-w-3xl space-y-8">
      <SectionHeader count={4}>To do ·</SectionHeader>
      <SectionHeader count={1}>Done ·</SectionHeader>
    </div>
  ),
}

export const Spinner: Story = {
  render: () => (
    <div className="max-w-3xl">
      <Row label="Inline in page.tsx (×2)">
        <div className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
      </Row>
    </div>
  ),
}
