# Design System Audit

Date: 2026-11-06 · Audited: `main` at `75374b9`\
Purpose: the baseline for the Aura design system PRD.

## Summary

Aura has a strong visual idea but almost no system around it. The shipped UI is editorial and
monochrome: square corners, hairline borders, a serif headline, a mono writing surface, and an
inverted-fill hover. The token layer and the component folders don't describe that UI. They
describe a generic, rounded, shadowed shadcn-style app that Aura moved away from.

Most of the "system" is dead or broken. You can't tell from the code which parts are real.

| Area                  | State                                                                               |
| --------------------- | ----------------------------------------------------------------------------------- |
| Color tokens          | AA-tuned text, but 4 of 6 roles are the same grey; the main input's frame is 1.26:1 |
| Dark mode             | Tokens exist; nothing ever applies `.dark`                                          |
| Typography            | 4 families loaded; no type scale tokens; sizes set ad hoc and on bare elements      |
| Radius / elevation    | Defined and almost entirely unused (the live UI is square and flat)                 |
| Motion                | Tokens exist; components hardcode `duration-250` / `duration-150` instead           |
| `src/components/ui`   | **0 imports.** Not shadcn. Hand-rolled, inaccessible, references missing classes    |
| `aura-primitives.tsx` | The real component layer; one file, mixed concerns                                  |
| `tailwind.config.ts`  | **Ignored by Tailwind v4.** Its utilities (`shadow-aura-*`, etc.) never generate    |
| Storybook             | Had 0 stories; Phase 0 added Foundations and Current UI stories                     |
| Docs                  | `docs/DESIGN_SYSTEM.md` is 20 lines and partly wrong                                |

## Visual baseline

Captured in Phase 0, before anything changes:

- **Storybook** (`pnpm storybook`): **Foundations** pages read the live tokens (color with
  contrast ratios, typography with computed metrics, shape, elevation and motion). **Current
  UI** has stories for the primitives, `TaskCard`, `TaskInput`, and the real home page in seven
  states, with Clerk and the API mocked. The Theme toolbar previews the unused dark tokens.
- **Screenshots** of every story and the real signed-out app at 390px and 1280px:
  [`docs/design-audit/`](design-audit/README.md). Re-run
  `node scripts/capture-design-baseline.mjs` after a change that should look identical, and
  compare.

## Inventory

### Tokens: `src/app/globals.css`

- **Color:** shadcn "neutral" roles in OKLCH (`background`, `foreground`, `card`, `popover`,
  `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`), with
  light and `.dark` values. `--muted-foreground`, `--input` and dark `--destructive-foreground`
  were adjusted for WCAG AA, and each change is commented.
- **Radius:** `--radius: 1.25rem` and a derived `sm` to `2xl` scale.
- **Elevation:** `--aura-shadow-xs` to `lg`, with light and dark values.
- **Motion:** `--aura-ease-out`, `--aura-duration-fast` (150ms), `--aura-duration-base` (250ms).
- **Fonts** (`@theme inline`): `sans` Geist, `serif` and `heading` Cormorant Garamond,
  `display` Fraunces, `mono` Geist Mono.
- **Missing:** type scale, spacing, z-index, layout widths, status colors (success, warning,
  info), a highlight color, and focus-ring tokens.

### Global element styles: `globals.css` `@layer base`

- Every `h1` to `h6` is Cormorant, semibold and balanced. `h1` is `text-5xl sm:text-6xl`, `h2`
  is `text-2xl` and `h3` is `text-xl`.
- Every `<button>` gets a square border, padding, and an inverted hover (`globals.css:140`).

### Component classes: `globals.css` `@layer components`

| Class                                  | Used by live code?                    |
| -------------------------------------- | ------------------------------------- |
| `.aura-btn-primary`                    | Yes (organize, Sign up, Clerk button) |
| `.aura-icon-btn`                       | Yes (`IconButton`)                    |
| `.aura-focus-ring`                     | Yes, but not on every button          |
| `.aura-shadow-lg`                      | Yes (one overlay card)                |
| `.aura-shadow-xs/sm/md`                | No                                    |
| `.aura-text-typewriter`, `.aura-caret` | Yes                                   |
| `.aura-badge`                          | Only by the dead `Badge`              |
| `.aura-text-micro`                     | No                                    |

### Components

**Live** (`src/components/aura-primitives.tsx`): `IconButton`, `PriorityBadge`, `PriorityDot`
(unused), `CategoryBadge`, `MetaText`, `CompletionCheckbox`, `SectionHeader`.

**Live, feature-level:** `Overlay`, `TaskCard`, `TaskInput`, `TaskList`, `TypewriterText`.

**Dead** (`src/components/ui/*`): `Badge`, `Button`, `Card`, `Checkbox`, `Dialog`, `Dropdown`,
`InputGroup`, `Input`, `Tabs`. Nothing imports any of them.

**Third party:** Clerk, themed through `src/lib/clerk-appearance.ts` and a dedicated `clerk`
cascade layer.

## Findings

Severity: **High** means it's broken or misleading now. **Medium** means it will cost real time
in the next features. **Low** is cleanup.

### High

1. **`tailwind.config.ts` is dead config.** Tailwind v4 reads config only through an `@config`
   directive, and `globals.css` has none. I compiled `globals.css` with the project's
   Tailwind: `shadow-aura-xs/sm/md/lg`, `duration-fast` and `duration-base` produce no CSS.
   The file also maps colors that don't exist (`--aura-urgent`, `--aura-success`,
   `--aura-surface-warm` and others), left over from the palette that was removed in
   `9ef0b10`. Anyone reading it gets a false picture of the system.
2. **`src/components/ui` is not shadcn, and nothing uses it.** `AGENTS.md` says the folder is
   "vendored shadcn/ui, don't edit". In fact there's no `components.json` and no Radix or Base
   UI dependency, and the files are hand-written stubs. They also reference classes that don't
   exist (`aura-btn-subtle`, `aura-btn-linklike`) and utilities that don't generate
   (`shadow-aura-*`). The AGENTS rule protects dead code and steers agents toward it.
3. **The overlay primitives aren't accessible.** `Dialog` has no focus trap, no Escape key, no
   focus return and no labelling. `Dropdown` is a `div` with `onClick`, without keyboard
   support, outside-click handling or ARIA. `Tabs` has no `tablist`/`tab` roles and no
   arrow-key navigation. They're dead today, but the Clarifying Intelligence review screen will
   need several of these patterns.
4. **Dark mode is half-built.** There's a full `.dark` token set and a `dark` custom variant,
   but no toggle, no `prefers-color-scheme` handling, and no `.dark` class anywhere. Clerk's
   appearance only references the light-or-dark-agnostic variables, so it would follow along,
   but the app has never shown the dark theme. Storybook's Theme toolbar now renders it
   (`docs/design-audit/baseline/storybook/*-dark-*.png`), and it holds together better than
   expected. The PRD needs to decide: support it or delete it.
5. **`docs/DESIGN_SYSTEM.md` is wrong.** It names `aura-transition-fast` (doesn't exist), tells
   you to "prefer `src/components/ui/*` primitives" (unused), and says "no hardcoded hex",
   while shadows use `rgba()` and the dialog scrim uses `bg-black/30`.
6. **The brain-dump textarea's frame fails non-text contrast.** It's the app's main control,
   and its boundary is `border-border` at **1.26:1** against the page (measured in Storybook,
   Foundations → Color). WCAG 1.4.11 asks 3:1 for the visual boundary of a control. The
   `--input` token (`oklch(0.65 0 0)`) was tuned for exactly this, but only the unused
   `ui/Input` uses it. The task cards share the same frame, which is fine for decoration.

### Medium

7. **The color roles don't carry meaning.** In light mode, `secondary`, `muted` and `accent` are
   all `oklch(0.97 0 0)`, and `primary` (0.205) is very close to `foreground` (0.145). The
   primary button uses `bg-foreground`, not `bg-primary`, while spinners use `border-t-primary`.
   The vocabulary is shadcn's, but the UI only really has three tones: ink, paper and grey.
   There's no `success` or `warning` color, and no `highlight` color, which the Clarifying
   Intelligence PRD needs for "the tasks that changed are briefly highlighted".
8. **Priority relies on faint grey differences.** `PRIORITY_CONFIG`
   (`aura-primitives.tsx:39`): urgent has a black dot, and high, medium and low all have the
   same grey dot. Text color alone separates urgent/high from medium/low. The label text keeps
   it accessible, but scanning a list by urgency doesn't work. This is the main gap between the
   monochrome style and what the product needs.
9. **There's no type scale.** Sizes come from Tailwind defaults on bare elements (`h1`/`h2`/`h3`
   in base), plus ad hoc classes in components (`text-base` ×11, `text-lg`, `text-xl`,
   `text-3xl` for a × glyph). Two custom one-offs live in CSS (`aura-text-micro`,
   `aura-text-typewriter` at `0.95rem / 1.9`). There are no named roles like `display`,
   `title`, `body`, `meta` or `label`. `.aura-text-typewriter` hardcodes the mono family
   (`globals.css:209`) instead of using `var(--font-mono)`.
10. **Four font families load on every page.** Cormorant Garamond (4 weights, 2 styles),
    Fraunces (with the `SOFT` and `WONK` axes) used only for the "aura" wordmark, Geist and
    Geist Mono. `--font-serif` and `--font-heading` are the same font. Discovery should decide
    whether Fraunces earns its weight or the wordmark becomes an SVG.
11. **Global `button` styling causes knock-on work.** Every `<button>`, including third-party
    ones, gets a border, padding and an inverted hover. `.aura-icon-btn` exists only to undo
    that, and Clerk needed its own cascade layer to sit between base and components. A
    `Button` component with variants would remove both workarounds.
12. **Focus styling is inconsistent.** `IconButton` and `CompletionCheckbox` use
    `.aura-focus-ring`. The organize, Sign in, Sign up and Try again buttons don't, so they fall
    back to the browser outline, and the base layer sets that outline's color to `ring/50`
    (`globals.css:112`). Measured: a 50% alpha `ring` on white is **1.96:1**, below the 3:1
    that focus indicators need.
13. **Motion tokens are bypassed.** Components use `duration-250`, `duration-150` and Tailwind's
    `ease-out`, not the `--aura-duration-*` and `--aura-ease-out` tokens, because the token
    utilities never generated (finding 1). `CompletionCheckbox` uses `transition-all`.
    `.aura-caret` and `TypewriterText` respect reduced motion; the overlay's scale and translate
    don't.
14. **Repeated patterns have no component.** The spinner is copied twice in `page.tsx` (lines
    114 and 124). Inline error text (`role="alert" text-base text-destructive`) is repeated 4
    times across `page.tsx`, `TaskInput` and `TaskCard`. The bordered panel
    (`border border-border p-4/p-6`) appears in `TaskInput`, `TaskCard` and the overlay card.
15. **No visual regression tests, and accessibility checks don't fail.** Storybook 10 runs
    with `addon-a11y` and `addon-vitest`. Phase 0 added the first stories (see
    [Visual baseline](#visual-baseline)), but `addon-a11y` is still set to `todo`, so violations
    don't fail anything, and Chromatic is installed with no workflow.
16. **Radius and elevation tokens contradict the UI.** `--radius` is 1.25rem, but the shipped UI
    is square (`rounded-none` on buttons, Clerk `borderRadius: '0'`) and flat (one shadow in the
    live UI). The tokens should describe the real style.

### Low

17. `TaskList.tsx:16` formats today's date with `toLocaleDateString('en-US', ...)`, which breaks
    the `AGENTS.md` rule that dates are formatted only through `src/lib/dates.ts`.
18. `PriorityDot` is exported and unused. `aura-primitives.tsx` mixes generic primitives
    (`IconButton`, `SectionHeader`) with task-domain ones (`PriorityBadge`, `CategoryBadge`).
19. `IconButton size="sm"` is 32×32px. That passes WCAG 2.2 AA (24px) but is below the 44px
    touch guideline, and the delete × is the main destructive control on mobile.
20. `CompletionCheckbox` draws its check as a text "✓", which renders differently across
    platforms. There's no icon set; the delete control is also a text "×".
21. `MIN_TEXTAREA_HEIGHT = 216` in `TaskInput` duplicates `min-h-54` (216px) in the same
    component.

## What works and should be kept

- **The visual identity is distinct.** Editorial serif headlines, a mono writing surface, ink on
  paper and square hairline frames give Aura character. The audit found inconsistency, not a
  weak direction.
- **Accessibility work is deliberate:** contrast-tuned tokens with comments explaining why,
  hover gated behind `@media (hover: hover)`, reduced-motion handling, an `sr-only` copy of
  the typewriter text, and `role="alert"` on errors.
- **OKLCH tokens through `@theme inline`** are the right base for Tailwind v4.
- **The Clerk integration** maps onto the same tokens through one file and a cascade layer.
- **The tooling is installed** (Storybook, a11y addon, Vitest browser mode, Playwright), so
  verification doesn't need new infrastructure.

## Context for the PRD

- **History shows churn:** cream, then lime/brown with "aura semantic colors" (`9ef0b10`),
  then neutral (`da28283`). A design-system page was added and later removed (`5d13339`). The
  PRD's discovery phase should settle the brand direction before tokens are renamed again.
- **The draft art direction pulls away from the current palette.** `docs/DESIGN_PRINCIPLES.md`
  (draft, PR #53) asks for "warmth through materiality: parchment, subtle grain, natural
  textures, muted colors", typography as the main character, and field-guide details like
  small-caps captions and fine ruled lines. The current tokens are pure greys at chroma 0 (see
  Foundations → Color), there's no small-caps or caption role, and there are no texture tokens.
  The typography and ruled lines already fit; color and materiality don't yet. Critique in the
  PRD should measure the baseline against these principles.
- **Upcoming UI (Clarifying Intelligence, v1.2)** needs things the system doesn't have yet: a
  two-pane layout that stacks on phones, question cards with 2–4 tap options (radio-group or
  chip semantics) plus an "Other" text field, a three-level button hierarchy (Update list, Ask
  follow-up questions, Done), a draft state for tasks, and a change highlight with its motion.
  The PRD already defers the highlight to the design system.
- **Decisions the PRD needs to make:**
  1. Headless primitives: adopt one library (Radix, Base UI or React Aria) or build our own.
     Building our own means taking on everything finding 3 lists.
  2. Dark mode: ship it or delete the tokens.
  3. Color: how to get the principles' warm, muted palette from today's pure greys, and whether
     to add one accent and status hues (priority, highlight, success).
  4. Token naming: keep shadcn role names, or rename to Aura's own (`ink`, `paper`, `rule`,
     ...).
  5. Where the system lives: rename or replace `src/components/ui`, and update `AGENTS.md` to
     match.
  6. Enforcement: lint rules for raw values and arbitrary classes, Storybook a11y set to
     `error`, and visual regression with Chromatic or Playwright screenshots.

## Suggested immediate cleanup (before the PRD lands)

These don't depend on any PRD decision:

- Delete `tailwind.config.ts`.
- Correct the "vendored shadcn/ui" line in `AGENTS.md`, or delete `src/components/ui`.
- Replace `docs/DESIGN_SYSTEM.md` with a pointer to this audit until the PRD is done.
- Route `TaskList`'s date through `src/lib/dates.ts`.
