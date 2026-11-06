import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SectionHeader } from '@/components/aura-primitives'
import { FoundationsPage, Specimen } from './Specimen'

// Every text treatment the live app uses, with its source and computed metrics. There is no
// type scale yet: each row is styled where it's used.

const PANGRAM = 'Sphinx of black quartz, judge my vow.'

const FAMILIES = [
  {
    name: 'Cormorant Garamond',
    className: 'font-heading',
    loaded: '400–700, normal and italic',
    usedFor: 'All headings (h1–h6 via base styles), the date line, Clerk titles',
  },
  {
    name: 'Fraunces',
    className: 'font-display',
    loaded: 'Variable, SOFT and WONK axes',
    usedFor: 'Only the "aura" wordmark',
  },
  {
    name: 'Geist',
    className: 'font-sans',
    loaded: 'Variable',
    usedFor: 'Body, meta text, buttons, subtasks, Clerk',
  },
  {
    name: 'Geist Mono',
    className: 'font-mono',
    loaded: 'Variable',
    usedFor: 'The brain-dump textarea (.aura-text-typewriter)',
  },
]

function TypographyPage() {
  return (
    <FoundationsPage
      title="Typography"
      intro="Four families and no type scale. Headings get their size from base styles on bare h1–h3; everything else sets Tailwind sizes where it's used."
    >
      <section className="space-y-2">
        <h2>Families</h2>
        {FAMILIES.map((family) => (
          <Specimen
            key={family.name}
            label={family.name}
            source={`${family.className} · loaded ${family.loaded}`}
          >
            <p data-measure className={`${family.className} text-3xl`}>
              {PANGRAM}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{family.usedFor}</p>
          </Specimen>
        ))}
      </section>

      <section className="space-y-2">
        <h2>Text in use</h2>

        <Specimen label="Wordmark" source="page.tsx · font-display text-3xl">
          <p data-measure className="font-display text-3xl">
            aura
          </p>
        </Specimen>

        <Specimen label="Page headline" source="h1 base style · text-5xl sm:text-6xl">
          <h1 data-measure>
            Just start <span className="italic">typing.</span>
          </h1>
        </Specimen>

        <Specimen label="Section header" source="SectionHeader · h2 base style · text-2xl">
          <div data-measure>
            <SectionHeader count={4}>To do ·</SectionHeader>
          </div>
        </Specimen>

        <Specimen label="Task title" source="TaskCard · h3 base style · text-xl">
          <h3 data-measure>Renew passport before the Lisbon trip</h3>
        </Specimen>

        <Specimen label="Date line" source="TaskList · font-heading text-xl lining-nums">
          <p data-measure className="font-heading text-xl lining-nums">
            Friday, November 6, 2026
          </p>
        </Specimen>

        <Specimen label="Subtasks" source="TaskCard · text-lg leading-relaxed">
          <ul data-measure className="space-y-1 text-lg leading-relaxed">
            <li>1. Find old passport</li>
            <li>2. Get new photos taken</li>
          </ul>
        </Specimen>

        <Specimen label="Meta text" source="MetaText, PriorityBadge · text-base muted">
          <p data-measure className="text-base text-muted-foreground">
            45m · Personal · <span className="italic">Tue, Nov 10</span>
          </p>
        </Specimen>

        <Specimen label="Notes" source="TaskCard · text-base italic leading-relaxed muted">
          <p data-measure className="text-base italic leading-relaxed text-muted-foreground">
            Current one expires in January; Portugal needs 3 months validity.
          </p>
        </Specimen>

        <Specimen label="Error" source="page, TaskInput, TaskCard · text-base text-destructive">
          <p data-measure className="text-base text-destructive">
            Couldn&apos;t organize that. Try again.
          </p>
        </Specimen>

        <Specimen label="Writing surface" source="TaskInput · .aura-text-typewriter">
          <p data-measure className="aura-text-typewriter">
            Brain dump any fragments, errands, worries, names, half-formed plans...
          </p>
        </Specimen>

        <Specimen label="Header counts" source="page.tsx · text-sm muted tabular-nums">
          <p data-measure className="text-sm text-muted-foreground tabular-nums">
            4 active · 1 done
          </p>
        </Specimen>

        <Specimen label="Button label" source="button base style · inherits body">
          <button data-measure type="button">
            organize
          </button>
        </Specimen>

        <Specimen label="Micro" source=".aura-text-micro" unused>
          <p data-measure className="aura-text-micro">
            Not used anywhere
          </p>
        </Specimen>

        <Specimen label="Badge" source=".aura-badge (unused ui/Badge)" unused>
          <span data-measure className="aura-badge bg-secondary text-secondary-foreground">
            Work
          </span>
        </Specimen>
      </section>
    </FoundationsPage>
  )
}

const meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

export const InUse: StoryObj = {
  name: 'In use',
  render: () => <TypographyPage />,
}
