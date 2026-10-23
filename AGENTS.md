# AGENTS.md

- `src/components/ui` is vendored shadcn/ui. Don't edit it except to fix a breaking bug; customize via
  `className`, tokens in `src/app/globals.css`, or a wrapper in `src/components`.
- Tailwind: use canonical utilities when a token exists (`max-w-184` not `max-w-[46rem]`).
  Resolve `suggestCanonicalClasses` warnings.
- `NEXT_PUBLIC_*` vars ship to the browser; never put secrets there.
- `pnpm dev` and `pnpm storybook` are long-running; don't run them as a blocking step.
- Commits: `type(scope): imperative summary` (feat, fix, refactor, docs, build, test, ci, chore).

## Dates and times

- Things the user plans (`dueDate`) are calendar dates: `IsoDate`, `"YYYY-MM-DD"`, Postgres `date`.
  Never parse them with `new Date(str)`; it reads them as UTC and shifts the day.
- Things that happened (`createdAt`, `completedAt`) are instants: `IsoTimestamp`, ISO 8601 UTC
  (`...Z`), Postgres `timestamptz`.
- The server never assumes its own timezone. "Today" comes from the user's IANA timezone, sent by
  the client.
- Convert to local time only in the UI, through `src/lib/dates.ts`.

## Skills

Skills live in `.agents/skills/<name>/SKILL.md`; `.claude/skills/` holds symlinks to them, and
agents pick them up from each skill's `description`. Vendored skills (sources in
`skills-lock.json`) are like `src/components/ui`: don't edit them; update with
`npx skills update -p -y`. Put Aura-specific guidance in Aura's own skills.

Where a vendored skill conflicts with this file, this file wins:

- Data fetching: TanStack Query (`src/lib/query`), not SWR.
- Dates: format only through `src/lib/dates.ts`.

## Pull requests

- The description states the PR's purpose and its final diff against `main`. Session history goes
  in commits, never in the description.
- To update it, re-read the description and `git diff main...HEAD`, then rewrite it. Don't append.
- If a change doesn't clearly fit the PR's purpose, ask first.

## Before you finish

`pnpm format && pnpm typecheck && pnpm lint && pnpm test`, then fix anything that fails.

## Agent skills

### Issue tracker

Issues live in Linear (team `AUR`, project "Aura"), used through the Linear MCP tools. See
`docs/agents/issue-tracker.md`.

### Triage labels

Linear labels on `AUR` use the canonical role names unchanged: `needs-triage`, `needs-info`,
`ready-for-agent`, `ready-for-human`, `wontfix`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root, created lazily. See
`docs/agents/domain.md`.
