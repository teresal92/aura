# Issue tracker: Linear

Issues and specs for this repo live in Linear: team **Aura** (key `AUR`), project **Aura**. Use the
Linear MCP tools (`mcp__linear-server__*`); there's no CLI.

## Conventions

- **Create an issue**: `save_issue` with `team: "AUR"`, `project: "Aura"`, `title`, `description`
  (Markdown, real newlines).
- **Read an issue**: `get_issue` with the identifier (e.g. `AUR-12`); `list_comments` for the
  thread.
- **List issues**: `list_issues` with `team: "AUR"` plus `label` / `state` filters.
- **Sub-issue**: `save_issue` with `parentId: "<parent identifier>"`.
- **Comment**: `save_comment` with `issueId`.
- **Apply / remove labels**: `save_issue` with `id` and `addLabels` / `removeLabels` (never
  `labels`, which replaces the whole set).
- **Close**: `save_issue` with `state: "Done"`, or `"Canceled"` when not actioned; comment the
  reason first.

Statuses: Backlog, Todo, In Progress, In Review, Done, Canceled, Duplicate. Existing type labels
(`Bug`, `Feature`, `Improvement`) are separate from the triage labels.

## Writing tickets

Write tickets at the level of outcomes, decisions and gotchas. Implementation detail goes stale once
building starts, so leave out full SQL, method chains, exact script names and file-by-file contents.

- Keep decisions (e.g. "RLS is the user boundary") and state gotchas as outcomes ("timestamps leave
  `toTask` as `...Z`").
- Make "Done when" precise and checkable.
- Exception: dashboard checklists and deploy steps can stay click-by-click.

## When a skill says "publish to the issue tracker"

Create a Linear issue in `AUR`, project "Aura".

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: an issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body.
- **Child ticket**: `save_issue` with `parentId: "<map>"`. Labels: `wayfinder:<type>`
  (`research`/`prototype`/`grilling`/`task`). Create any missing `wayfinder:*` label on `AUR` first
  with `save_issue_label`.
- **Blocking**: Linear's native relations, `save_issue` with `blockedBy: ["AUR-n"]`. A ticket is
  unblocked when every blocker is Done or Canceled.
- **Frontier query**: `list_issues` with `parentId: "<map>"`, open states only; drop any with an
  open blocker or an assignee; first in map order wins.
- **Claim**: `save_issue` with `assignee: "me"`, the session's first write.
- **Resolve**: comment the answer, set `state: "Done"`, then append a context pointer (gist + link)
  to the map's Decisions-so-far.
