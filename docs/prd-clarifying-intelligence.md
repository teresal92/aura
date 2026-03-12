# PRD: Clarifying Intelligence

Status: Proposed\
Target Version: v1.2\
Owner: Aura\
Dependencies: - Supabase authentication - `/api/parse-tasks` endpoint -
Next.js API routes - AI provider integration (OpenAI or Anthropic)

---

# Overview

Aura currently converts free-form user input into structured tasks using
an AI parsing step.

Example:

User input:

> "I need to do laundry today and call my mom"

→ Structured tasks:

- Do laundry
- Call Mom

This works well when tasks are explicit. However, many real inputs are
ambiguous or represent **projects rather than discrete tasks**.

Example:

> "Plan Yosemite trip"\
> "Deal with taxes soon"\
> "Figure out groceries for the week"

In these cases the system must either guess or generate overly generic
tasks.

The **Clarifying Intelligence** feature introduces a lightweight
clarification loop where Aura asks short follow-up questions when the
input is ambiguous before generating final tasks.

The goal is to make Aura feel like a **thinking partner** rather than a
passive parser.

---

# Problem

Users frequently express intentions in ways that are:

- vague
- project-based
- missing important details
- multi-step

Without clarification the AI may:

- generate incorrect tasks
- miss important subtasks
- reduce user trust in the system

Example failure case:

User input:

> "Plan Yosemite trip"

Naive extraction:

- Plan Yosemite trip

But the real workflow likely involves:

- research campsites
- plan meals
- check weather
- plan route

Clarifying Intelligence allows the system to surface these possibilities
before finalizing tasks.

---

# Goals

## Primary goals

1.  Improve task extraction accuracy
2.  Increase user trust in AI interpretation
3.  Reduce manual editing of generated tasks
4.  Support project-level planning input

## Secondary goals

- Make Aura feel collaborative rather than automated
- Support cognitive offloading for planning workflows
- Maintain minimal cognitive load

---

# Non-Goals

Clarifying Intelligence is **not intended to become a full
conversational chatbot.**

Constraints:

- Maximum one clarification round
- No persistent chat thread
- Minimal UI footprint
- Short messages only

The experience should remain consistent with Aura's low-friction design
philosophy.

---

# User Stories

## Story 1 --- Project planning

User input:

> "Plan Yosemite trip"

Aura response:

This looks like a planning project.\
Would you like help breaking it into tasks?

Suggested tasks:

- Research campsites
- Plan meals
- Check weather
- Plan route

User selects tasks → tasks are created.

---

## Story 2 --- Missing information

User input:

> "Dentist appointment this week"

Aura asks:

Do you know the exact day?

Options:

- Monday
- Tuesday
- Wednesday
- Not sure yet

---

## Story 3 --- Complex task

User input:

> "Get taxes sorted"

Aura suggests:

This may involve multiple steps.

Possible tasks:

- Gather documents
- Review deductions
- File return
- Schedule accountant

---

# UX Design

Clarification appears **inline beneath the input box**.

Interaction flow:

User brain dump → AI task parsing → Ambiguity detection → Clarification
prompt → User confirmation → Final task creation

Design constraints:

- No modal dialogs
- No full chat interface
- Inline suggestion card
- One clarification step maximum

---

# System Design

## Current pipeline

User input → `/api/parse-tasks` → LLM structured output → Tasks stored

## Updated pipeline

User input → `/api/parse-tasks` → Ambiguity detection →
`/api/clarify-input` → User confirmation → Tasks saved

---

# New API Endpoint

POST `/api/clarify-input`

Request:

{ "input": "Plan Yosemite trip" }

Response:

{ "clarificationNeeded": true, "message": "This looks like a planning
project.", "suggestedTasks": \[ "Research campsites", "Plan meals",
"Check weather", "Plan route" \] }

---

# Acceptance Criteria

The feature is complete when:

1.  Ambiguous inputs trigger a clarification step
2.  Suggested tasks can be accepted or edited
3.  Clarification UI appears inline beneath input
4.  Only one clarification round occurs
5.  Final tasks are saved via the existing pipeline

---

# Product Impact

Clarifying Intelligence moves Aura from:

**task extraction tool**

to

**cognitive planning assistant**.

Instead of simply organizing thoughts, Aura helps users translate
**intentions into actionable steps**.
