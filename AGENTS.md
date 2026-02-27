# AGENTS.md

## Project Overview

Aura is currently a single-package Next.js 16 App Router project focused on a design-system-first UI foundation for an AI todo app. The repository contains a minimal home page (`src/app/page.tsx`) and a richer design-system showcase (`/design-system`) with tokenized components.

The implemented architecture today is frontend-only: Next.js pages, local UI primitives, and shared styling tokens in `src/app/globals.css`. API routes, persistence, and full task flows described in `README.md` are mostly roadmap/target-state, not present in `src/` yet.

Core relationship map: app routes render sections/components, those compose `src/components/aura-primitives.tsx` and `src/components/ui/*`, and all styling is expected to flow through Aura CSS variables + Tailwind utility classes.

## Repo Map

- `src/app/layout.tsx`: root layout + font setup (`next/font/google`).
- `src/app/page.tsx`: current home route (minimal placeholder).
- `src/app/design-system/*`: design system route and section demos.
- `src/components/aura-primitives.tsx`: app-level primitive components (`AuraLogo`, priority/category/meta UI).
- `src/components/ui/*`: stable/vendor-like primitive layer (treat as low-churn).
- `src/app/globals.css`: source of truth for tokens, semantic colors, shadows, motion utilities.
- `src/lib/utils.ts`: shared utility (`cn`).
- `.storybook/*`: Storybook config + Vitest Storybook integration.
- `eslint.config.mjs`: ESLint flat config (Next + TS + Storybook + Prettier compatibility).
- `vitest.config.ts`: Vitest config targeting Storybook browser tests.
- `docs/DEVELOPMENT.md`, `docs/DEPLOYMENT.md`: process docs (partly aspirational).

## Setup Commands

Run from repo root:

```bash
npm install
```

Runtime/tooling versions discovered locally:

- Node requirement from `next@16.1.6`: `>=20.9.0`
- Local verified versions: Node `v22.17.0`, npm `11.10.1`

Environment setup:

- Local env file: `.env.local`
- Existing keys in `.env.local` (names only):
  - `AI_PROVIDER`
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`
  - `ANTHROPIC_API_KEY`
  - `ANTHROPIC_MODEL`

## Run Commands

Run from repo root:

```bash
npm run dev
```

Other local workflows:

```bash
npm run storybook          # Starts Storybook on :6006
npm run start              # Serves production build after build
```

## Test Commands

Current state:

- No `npm test` script in `package.json`.
- No `*.test.*` / `*.spec.*` files currently in `src/`.
- `vitest.config.ts` exists and is configured for Storybook/browser test projects.

If/when tests are added, use:

```bash
npx vitest run
npx vitest --project storybook
```

Targeted test patterns:

```bash
npx vitest run src/path/to/file.test.tsx
npx vitest run -t "test name"
```

## Lint / Format / Typecheck

Run from repo root:

```bash
npm run lint
npm run format:check
npm run format
npx tsc --noEmit
```

Pre-commit behavior:

- Husky hook `.husky/pre-commit` runs `npx lint-staged`.
- Staged `*.{ts,tsx}`: `eslint --fix` + `prettier --write`.
- Staged `*.{json,css,md}`: `prettier --write`.

## Build / Release

Build command:

```bash
npm run build
```

Observed caveat:

- Build currently depends on fetching Google Fonts via `next/font/google` (`DM Sans`, `Geist`, `Geist Mono`) from `src/app/layout.tsx`.
- In offline/restricted-network environments, build fails during font fetch.

Start built app:

```bash
npm run start
```

CI notes:

- No `.github/workflows/*` detected in this repo.
- No release automation scripts detected in `package.json`.

## Environment Variables

Where defined/used:

- Local developer env file: `.env.local` (gitignored by `.gitignore`).
- Names currently present are AI-provider related only (see Setup section).
- No active `process.env` reads were found in `src/` at time of writing.

Guidance:

- Treat `.env.local` as local-only secrets.
- Never commit secret values.
- If adding new env vars, document names and required/optional status here.

## Code Style & Patterns

Do:

- Use TypeScript strict mode conventions already enabled in `tsconfig.json`.
- Keep styling token-driven via `src/app/globals.css` variables and semantic Tailwind classes.
- Compose app-specific UI in `src/components/aura-primitives.tsx` or other app-level components.
- Use `@/*` path aliases from `tsconfig.json`.
- Keep UI behavior simple and explicit (small components, clear props).

Do not:

- Hardcode one-off colors/shadows when a token exists.
- Edit `src/components/ui/*` unless necessary (see Safety & Boundaries).
- Assume README roadmap architecture (API routes/Supabase/state layers) already exists.

## PR Expectations

Before opening/updating a PR, run:

```bash
npm run lint
npm run format:check
npx tsc --noEmit
npm run build
```

PR quality bar:

- Keep diffs scoped and intentional.
- Update docs (`README.md`, `AGENTS.md`, or `docs/*`) when behavior/workflows change.
- Include tests when adding logic that can regress.
- Call out any environment or migration impact explicitly.

## Safety & Boundaries

- Treat `src/components/ui` as a vendor/stable layer.
- Prefer token updates (`src/app/globals.css`) and `className` composition over direct primitive rewrites.
- If direct `src/components/ui/*` edits are unavoidable, keep changes minimal and explain why in PR notes.
- Do not commit secrets from `.env*` files.
- Avoid destructive git/file operations unless explicitly requested.

## Working with Codex

### When to run commands vs reason from code

- Ask Codex to run commands when you need verification (lint/build/typecheck/test output, file discovery, config inspection).
- Ask Codex to reason-only when you want design/architecture feedback without touching files.
- If network access may affect results (for example `next/font/google` during build), mention that constraint in your prompt.

### How to ask for changes

- Request small diffs with exact file paths and expected outcome.
- State acceptance criteria (UI behavior, command output, tests expected to pass).
- Say whether docs and tests must be updated as part of the same change.

### Codex completion checklist

Before finishing a task, Codex should:

1. Re-scan touched files for unintended changes.
2. Run relevant checks (`lint`, `format:check`, `tsc`, tests/build as applicable).
3. Update docs for any workflow/behavior/config changes.
4. Report what was verified vs what could not be verified.

## TODO (needs confirmation)

- Confirm whether the team wants a first-class `npm test` script (Vitest is configured but not wired in `package.json`).
- Confirm whether CI should be added (none detected under `.github/workflows/`).
- Confirm whether production builds must work without external font fetch (if yes, switch to local fonts or add fallback strategy).
- Confirm whether roadmap docs in `README.md` should be split from current-state docs to reduce onboarding confusion.
