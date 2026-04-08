# Codex Execution Plans (ExecPlans)

This document defines the requirements for an execution plan ("ExecPlan"). An ExecPlan is a self-contained design-and-implementation guide that a coding agent can follow to deliver a working change. Assume the reader is new to this repository and has only the current working tree and the ExecPlan in front of them.

## How To Use ExecPlans And PLANS.md

When authoring an ExecPlan, read this file end-to-end and follow it exactly. Start from the skeleton in this document and expand it as you research the codebase. Be explicit about assumptions, data flows, and the precise edits you will make.

When implementing an ExecPlan, proceed milestone by milestone without asking for "next steps." Keep all living sections updated, split tasks when partially complete, resolve ambiguity directly in the plan, and commit frequently.

When discussing or revising an ExecPlan, record decisions in the Decision Log and keep the plan consistent across all sections so a newcomer can restart from the plan alone.

When the requirements are uncertain, add explicit prototyping milestones that validate feasibility. Include commands and expected outcomes for each prototype.

## Requirements

NON-NEGOTIABLE REQUIREMENTS:

- Every ExecPlan must be fully self-contained and understandable by a novice.
- Every ExecPlan is a living document and must be revised as work progresses.
- Every ExecPlan must enable an end-to-end implementation that produces a working, observable behavior.
- Every ExecPlan must define any non-obvious term in plain language or avoid using it.

Purpose and user-visible outcomes come first. Begin with a short explanation of why the work matters and how to see it working. Then describe the exact steps to implement the change, including files, commands, and expected results.

Do not rely on external documentation or prior plans. If knowledge is required, include it directly in the plan in your own words. If a prior ExecPlan is checked in and relevant, summarize the needed context explicitly.

## Formatting

Each ExecPlan must be a single fenced code block labeled `md` that begins and ends with triple backticks. Do not nest additional code fences. When you need to show commands or code, use indented blocks inside that single fence. If the Markdown file contains only the ExecPlan, omit the outer code fence.

Use headings correctly and keep two blank lines after every heading. Write in plain prose. Avoid tables and long checklists. Checklists are only allowed in the Progress section, where they are required.

## Living Plans And Design Decisions

ExecPlans are living documents. These sections are mandatory and must be maintained as work proceeds:

- Progress
- Surprises & Discoveries
- Decision Log
- Outcomes & Retrospective

Record unexpected behaviors, performance tradeoffs, or bugs with short evidence. If you change direction, log the rationale in the Decision Log and reflect the impact in Progress.

## Prototyping Milestones And Parallel Implementations

Use explicit prototyping milestones to reduce risk. Label them as "prototyping" and explain how to run and evaluate them. Prefer additive changes first, then remove temporary paths once tests pass. Parallel implementations are allowed when they reduce migration risk, but you must describe how to validate both paths and how to retire the old one safely.

## Skeleton Of A Good ExecPlan

# <Short, action-oriented description>

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

If `PLANS.md` is checked into the repo, reference it here by repository-relative path and note that this document must follow its requirements (e.g., `.agent/PLANS.md`).

## Purpose / Big Picture

Explain in a few sentences what the user gains after this change and how they can see it working.

## Progress

Use a checklist with timestamps. Every stopping point must be recorded, and partially completed work must be split into done vs. remaining.

- [x] (YYYY-MM-DD HH:MMZ) Example completed step.
- [ ] Example incomplete step.
- [ ] Example partially completed step (completed: X; remaining: Y).

## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights with concise evidence.

- Observation: ...
- Evidence: ...

## Decision Log

Record decisions as they are made.

- Decision: ...
- Rationale: ...
- Date/Author: ...

## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion. Compare results against the original purpose.

## Context And Orientation

Describe the current state as if the reader knows nothing. Name the key files and modules by full path. Define any non-obvious term. Do not refer to prior plans.

## Plan Of Work

Describe, in prose, the sequence of edits and additions. For each edit, name the file and location (function, module) and what to insert or change.

## Concrete Steps

State the exact commands to run and the working directory. When a command generates output, show a short expected transcript so the reader can compare.

## Validation And Acceptance

Describe how to exercise the system and what to observe. Phrase acceptance as user-visible behavior, with specific inputs and outputs. If tests are involved, name the exact test command and expected results.

## Idempotence And Recovery

State which steps are safe to repeat and provide safe retry or rollback paths for risky steps.

## Artifacts And Notes

Include concise transcripts, diffs, or snippets as indented examples that demonstrate success.

## Interfaces And Dependencies

Be prescriptive. Name the libraries, modules, and services to use and why. Specify types, interfaces, and function signatures that must exist at the end of the milestone, using stable names and full paths.

## Revision Notes

When revising the plan, add a short note at the end describing what changed and why.
