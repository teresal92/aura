# AGENTS.md

- `src/components/ui` is vendored shadcn/ui. Don't edit it except to fix a breaking bug; customize via
  `className`, tokens in `src/app/globals.css`, or a wrapper in `src/components`.
- Tailwind: use canonical utilities when a token exists (`max-w-184` not `max-w-[46rem]`).
  Resolve `suggestCanonicalClasses` warnings.
- `NEXT_PUBLIC_*` vars ship to the browser; never put secrets there.
- `pnpm dev` and `pnpm storybook` are long-running; don't run them as a blocking step.
- Commits: `type(scope): imperative summary` (feat, fix, refactor, docs, build, test, ci, chore).
- For complex work (3+ files, or a data model/API change), write an ExecPlan per `.agent/PLANS.md` first.

## Before you finish

`pnpm format && pnpm typecheck && pnpm lint && pnpm test`, then fix anything that fails.
