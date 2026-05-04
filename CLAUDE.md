# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Production build
pnpm typecheck        # TypeScript check (no emit)
pnpm lint             # ESLint
pnpm test             # Vitest — runs unit tests (src/**/*.test.ts[x]) and Storybook tests
pnpm format           # Prettier write
pnpm format:check     # Prettier check
pnpm storybook        # Storybook on port 6006
```

Run a single test file: `pnpm test -- src/lib/__tests__/dates.test.ts`

## Architecture

Aura is an AI-powered todo app built with Next.js 16 App Router. The core flow:

1. User types free-form text (e.g., "I need to do laundry and call my mom")
2. Browser POSTs to `/api/parse-tasks` (`src/app/api/parse-tasks/route.ts`)
3. The route validates auth via Clerk, then calls `parseTasks()` in `src/lib/ai.ts`
4. `src/lib/ai.ts` dispatches to OpenAI (default) or Anthropic based on `AI_PROVIDER` env var, using the system prompt in `src/lib/prompts.ts`
5. The API returns structured `Task[]` to the client
6. The client stores tasks in the Zustand store (`src/store/tasks.ts`), which auto-sorts by priority (urgent → high → medium → low, completed tasks last)

The `Task` type (`src/types/task.ts`) is the central contract shared across the API, store, and UI.

**TanStack Query** (`@tanstack/react-query`) is being added — `src/lib/query-client.ts` holds the singleton `QueryClient`. Server mutations and data fetching should migrate to TQ hooks over time.

**Auth** is Clerk-only (`@clerk/nextjs`). All API routes call `auth()` from `@clerk/nextjs/server` and return 401 if unauthenticated. `ClerkProvider` wraps the app in `src/app/layout.tsx`.

**State** lives entirely client-side in Zustand (`src/store/tasks.ts`). There is no database yet — tasks are in-memory per session.

## Design System

`src/app/globals.css` is the source of truth for all design tokens, shadows, and motion utilities. Use:

- Tailwind semantic tokens: `bg-background`, `text-foreground`, `border-border`
- Aura semantic colors: `bg-aura-urgent/10`, `text-aura-success`
- Aura utilities: `aura-shadow-sm`, `aura-transition-fast`, `aura-focus-ring`
- Light/dark theming via `.dark` class on `<html>` — tokens defined under `:root` and `.dark`

`src/components/ui/` is a shadcn-style vendor layer — avoid editing these files directly unless fixing a breaking bug. Prefer `className` overrides or wrappers in `src/components/`.

Prefer canonical Tailwind utilities over arbitrary values (e.g., `max-w-184` not `max-w-[46rem]`). Treat `suggestCanonicalClasses` warnings as required cleanup.

## Environment Setup

Copy `.env.example` to `.env.local`. Required variables:

```
AI_PROVIDER=openai          # or "anthropic"
OPENAI_API_KEY=...
OPENAI_MODEL=               # optional, defaults to gpt-5-mini
ANTHROPIC_API_KEY=...       # only needed if AI_PROVIDER=anthropic
ANTHROPIC_MODEL=            # optional, defaults to claude-3-5-sonnet-20241022
```

Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) must also be in `.env.local`.

## Code Conventions

- Prettier: `singleQuote: true`, `semi: false`, `trailingComma: 'es5'`, `tabWidth: 2`, `printWidth: 100`
- Pre-commit hooks (Husky + lint-staged) auto-run ESLint --fix and Prettier on staged files
- Commits follow Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `test:`
- Tests are co-located next to source files (`*.test.ts` / `*.test.tsx`)
- Use React Testing Library role/text queries, not implementation details

## ExecPlans

For complex features or significant refactors, create an ExecPlan following the spec in `.agent/PLANS.md`. Store plans as `.agent/<name>.md`. ExecPlans are living documents — update Progress, Surprises, Decision Log, and Retrospective sections as work proceeds.
