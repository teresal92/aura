# Repository Guidelines

## Project Structure & Module Organization

- `src/app`: Next.js App Router pages, layouts, and API routes.
- `src/components`: App components. `src/components/ui` is a vendor layer (shadcn/ui); avoid direct edits unless fixing a breaking bug. Prefer `className` overrides, tokens in `src/app/globals.css`, or wrappers in `src/components`.
- `src/lib`: Shared utilities and AI/provider logic.
- `src/store`: Zustand stores.
- `src/types`: Shared TypeScript types.
- `public`: Static assets.
- `docs`: Architecture, development, deployment, and design docs.
- Tests are co-located: `src/**/*.test.ts(x)`.

## Build, Test, and Development Commands

- `npm run dev`: Start the Next.js dev server.
- `npm run build`: Production build.
- `npm run start`: Run the built app.
- `npm run typecheck`: TypeScript type check only.
- `npm run lint`: ESLint across the repo.
- `npm test`: Run Vitest (unit + Storybook tests).
- `npm run storybook`: Run Storybook locally.
- `npm run format` / `npm run format:check`: Prettier write/check.

## Coding Style & Naming Conventions

- TypeScript-first, React components in `.tsx`.
- Prettier enforces `tabWidth: 2`, `singleQuote: true`, `semi: false`, `printWidth: 100` (see `.prettierrc`).
- ESLint uses Next.js + TypeScript + Storybook rules (`eslint.config.mjs`).
- Tests follow `*.test.ts` / `*.test.tsx` naming and live next to the code.

## Testing Guidelines

- Vitest is the primary runner; Storybook tests run via the Vitest Storybook addon (`vitest.config.ts`).
- Use React Testing Library for component behavior (favor role/text queries).
- Run `npm test` locally before opening a PR.

## Commit & Pull Request Guidelines

- Commit messages follow a Conventional Commits style seen in history: `feat:`, `fix:`, `docs:`, `chore:`, `test:` with concise, imperative subjects.
- PRs should include: a clear description, linked issues (if any), and UI screenshots for visual changes (see `docs/` for reference assets).

## Configuration & Secrets

- Local env setup lives in `.env.local` (see `.env.example`).
- Never commit secrets; prefer `NEXT_PUBLIC_*` only for non-sensitive values.
