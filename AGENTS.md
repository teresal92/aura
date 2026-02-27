# AGENTS Guidelines for This Repository

<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

This repository is a Next.js app in the repo root.

## 1. Use Dev Server During Agent Iteration

- Use `npm run dev` while iterating.
- Do not run `npm run build` during normal interactive agent sessions, unless the user explicitly asks for a production build check.
- Why: production build output in `.next` can interfere with expected HMR behavior during live iteration.

## 2. Keep Dependencies in Sync

When updating packages:

1. Update `package-lock.json` together with `package.json`.
2. Keep `next` and `eslint-config-next` on matching versions.
3. Re-start the dev server after dependency changes.

## 3. Repo-Specific Boundaries

- Treat `src/components/ui` as a vendor/stable primitive layer.
- Prefer token and class overrides via `src/app/globals.css` and app-level wrappers in `src/components`.
- If direct edits in `src/components/ui/*` are required, keep them minimal and document why.

## 4. Coding Conventions

- Prefer TypeScript (`.ts`/`.tsx`) for new code.
- Use `@/*` imports from `tsconfig.json` paths.
- Keep styling token-driven using `src/app/globals.css` variables and semantic Tailwind classes.

## 5. Useful Commands

- `npm run dev`: Start Next.js development server.
- `npm run lint`: Run ESLint.
- `npx tsc --noEmit`: Type-check.
- `npm run storybook`: Start Storybook.
- `npm run build`: Production build (avoid during routine agent iteration).
