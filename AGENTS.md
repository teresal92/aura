# AGENTS.md

- `src/components/ui` is vendored shadcn/ui. Don't edit it except to fix a breaking bug; customize via
  `className`, tokens in `src/app/globals.css`, or a wrapper in `src/components`.
- Before UI or visual design work, read `docs/DESIGN_PRINCIPLES.md` (art direction) and
  `docs/DESIGN_SYSTEM.md` (tokens).
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

## Comments

Write a comment only for the _why_ the code can't show: a hazard, a constraint, or a non-obvious choice. Keep it to one line.

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

A PR is done when CI is green, it isn't a draft, and it follows the commit convention. UI changes
also include screenshots at mobile and desktop widths from the running app (a short video if the
change is interactive). Start the dev server in the background to capture them.

## Planning and tracking

- Linear holds tickets, PRDs, and briefs. Don't add planning docs to the repo; link to the ticket.
- Keep the `AUR` ticket's status current yourself. Surface only decisions that need a human; for
  everything else, make the call and note it in the ticket or PR.
- Before splitting work across agents, decide and record any shared contract in the ticket first:
  DB schema, `src/types/database.ts`, or props shared between components.

## Review routing

Label the PR `needs-review` and don't merge it if it touches:

- `supabase/migrations`, schema, or row-level security
- Clerk or auth config
- new dependencies
- deletion of user data
- CI, deploy, or agent config (`.github`, `.claude`, `AGENTS.md`)

Low-risk changes (UI behind a flag, styling, copy, tests, docs) can merge once CI is green. If
you're unsure which applies, treat it as `needs-review`.

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
