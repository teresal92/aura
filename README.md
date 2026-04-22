# 🌟 Aura

> _Your thoughts, organized. Your tasks, simplified. Your brain, supported._

Aura is an AI-powered todo app built for minds that work in bursts, get lost in the planning, or forget things exist until they're urgent. Instead of forcing you into rigid forms and overwhelming lists, Aura lets you just _talk_ — type whatever's swirling around in your head — and it does the heavy lifting of turning that chaos into calm, structured tasks.

```
"ok so i really need to do laundry today, also i have that dentist thing at some point
this week and i keep forgetting to reply to sarah's email which is actually kind of urgent"
```

↓

```
✅ Do laundry          · Today · ~45 min · Home
📅 Dentist appointment · This week · Personal
⚡ Reply to Sarah      · Urgent · ~5 min · Communication
```

No forms. No dropdowns. No friction. Just you and a text box.

---

## Why Aura Exists

Most task management apps assume you've already done the hard part. They expect you to arrive knowing what needs doing, in what order, by when, and how long each thing will take. For a lot of people — especially those who think in bursts, get paralyzed by open-ended choices, or lose the thread between "I should do this" and actually starting — that planning step _is_ the hard part.

Aura removes it. The cognitive work of breaking down, categorizing, and prioritizing tasks gets handed off to AI, so your brain can focus on actually doing things instead of agonizing over how to organize them.

It's built especially with **ADD/ADHD and other attention-diverse minds** in mind — but honestly, if you've ever stared at a blank task list and felt nothing, Aura is for you.

---

## Who Aura Is For

Aura is designed for people who recognize themselves in any of these:

- You know you have things to do, but can't figure out where to start
- You underestimate how long tasks take, then feel overwhelmed when they pile up
- You need external structure to prioritize — your brain doesn't do it automatically
- A cluttered or busy UI makes you close the app entirely
- You're great at _doing_ things, but the planning and organizing part feels like a separate, exhausting job

These experiences are especially common in people with **ADD/ADHD and other attention-diverse or neurodivergent profiles** — and that's who Aura was specifically designed with in mind. But you don't need a diagnosis to benefit. If the description above resonates, Aura was made for you.

## Design Philosophy

No onboarding, no tutorial, no manual. If you can type a sentence, you can use it.

**Simplicity** — Every feature has to earn its place. If it adds complexity without clear value, it doesn't ship.

**Low friction** — One input, accepts anything. When something is vague, Aura asks a short follow-up rather than guessing. You decide when it's right.

**Less on screen** — Only what's needed, when it's needed. Details are one tap away. Nothing is designed to pull your attention.

**Feels good to use** — Completing a task is rewarding. Urgency is clear without being anxiety-inducing.

**Gets better over time** — Aura quietly learns your patterns and adjusts. No settings to configure.

---

## Core Features

### 🗣️ Free-Form AI Input

A single, inviting text area at the top of the app. Type your day, your week, a brain dump, a half-remembered obligation — whatever's in your head. Hit enter. Done.

### 🧠 AI Task Parsing

Behind the scenes, the AI extracts structured tasks from your input — each one gets a title, priority, time estimate, due date (if mentioned), category, and subtasks where relevant. You don't fill any of that in. It's inferred from what you typed.

### 🗂️ Task View

The default view is a clean, uncluttered list. Most urgent at the top, nothing competing for attention. You can sort, filter, or dismiss tasks without it feeling like operating a control panel.

### 🃏 Smart Task Cards

Tasks are rendered as minimal cards. The default view shows only the title, priority, and estimated time. Everything else is a tap away. No walls of text, no overwhelming detail.

### 🎯 Focus Mode

One task. Full screen. Nothing else. Focus Mode strips away the task list entirely and presents a single task with a gentle timer and a big, satisfying completion button. For when you're ready to work and need the world to disappear.

### 🔔 Gentle Nudges

Optional, non-intrusive reminders. No aggressive notifications, no overdue task counts, no guilt. Just a soft prompt asking if something on your list still needs doing.

### 🎉 Quick Wins

Completing a task feels good — a small animation, a satisfying checkmark. Rewarding enough to motivate, subtle enough not to distract.

### 🤔 Clarifying Intelligence

When your input is vague or describes a project rather than a discrete task — "plan Yosemite trip", "sort out taxes" — Aura doesn't guess. It asks a short follow-up question inline, suggests a set of concrete tasks, and lets you confirm, adjust, or keep refining until it feels right. No back-and-forth chat interface — just a lightweight clarification card beneath the input that stays out of your way.

```
You typed: "Get taxes sorted"

Aura: This might involve a few steps. Want to break it down?
  ☑ Gather documents
  ☑ Review deductions
  ☐ Schedule accountant
  ☑ File return

          [ Looks good → ]  [ Refine further → ]
```

### 🧬 Personalization

Aura learns how you work over time. It picks up on patterns in your input — the categories you use most, how you tend to estimate time, the type of language that signals urgency for you — and quietly adjusts its defaults to match. No settings to configure. It just gets better the more you use it.

---

## Tech Stack

We evaluated CRA, Vite, Next.js, and Remix — Next.js won for its API routes, Vercel-native deployment, and ability to ship the frontend and backend proxy as a single unit. See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full breakdown.

| Layer                | Choice                                      | Rationale                                                                                                          |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Framework**        | Next.js (App Router)                        | API routes, Vercel-native, excellent DX                                                                            |
| **Styling**          | Tailwind CSS                                | Utility-first makes it easy to enforce the clean, minimal aesthetic consistently; excellent for responsive design  |
| **State Management** | Zustand                                     | Lightweight, minimal boilerplate, no provider hell — React Context would get messy fast; Redux Toolkit is overkill |
| **AI Integration**   | OpenAI or Anthropic (via Next.js API route) | Both support structured JSON output and are swappable behind the API route                                         |
| **Database**         | Supabase                                    | Postgres-backed, real-time capable, built-in auth, generous free tier, great DX                                    |
| **Auth**             | Supabase Auth                               | Comes with Supabase; supports magic links (lower friction than passwords — one less thing to forget)               |

---

## AI Provider

Aura's AI layer is intentionally provider-agnostic. The task parsing logic lives behind a single Next.js API route (`/api/parse-tasks`), so swapping providers is a one-file change. Both of the following are well-supported:

| Provider      | Model                    | Strengths for Aura                                                                                                                  |
| ------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **OpenAI**    | `gpt-4o` / `gpt-4o-mini` | Native `json_object` response format enforcement; `gpt-4o-mini` is very cost-effective for short parsing tasks                      |
| **Anthropic** | `claude-sonnet-4-5`      | Excellent at interpreting ambiguous, casual, stream-of-consciousness input; strong instruction-following for nuanced system prompts |

Set your preferred provider via environment variables — see [Getting Started](#getting-started). The system prompt below works with both.

## AI Prompt Design

All prompts are defined as constants in `lib/prompts.ts` — that's the single source of truth. If you need to adjust extraction rules, ambiguity detection behaviour, or the clarification flow, that's the only file you need to touch.

The parsing prompt handles two responsibilities in a single pass: extracting structured tasks from free-form input, and flagging ambiguous or project-level input for the clarification flow. Personalization context is injected at call time when available.

### Example — direct extraction

**User input:**

```
ok so i really need to do laundry today, also i have that dentist thing at some point
this week and i keep forgetting to reply to sarah's email which is actually kind of urgent
```

**AI output:**

```json
{
  "tasks": [
    {
      "title": "Do laundry",
      "priority": "high",
      "estimatedDuration": 90,
      "dueDate": "2025-01-15T23:59:00Z",
      "category": "Home",
      "subtasks": ["Sort clothes", "Run wash cycle", "Transfer to dryer", "Fold and put away"],
      "userContext": null,
      "aiNotes": null,
      "ambiguous": false,
      "clarificationPrompt": null,
      "source": "direct"
    },
    {
      "title": "Dentist appointment",
      "priority": "medium",
      "estimatedDuration": 60,
      "dueDate": null,
      "category": "Health",
      "subtasks": [],
      "userContext": "User mentioned 'this week'",
      "aiNotes": "Date unconfirmed — may need to verify actual appointment time",
      "ambiguous": true,
      "clarificationPrompt": "Do you know which day your dentist appointment is?",
      "source": "direct"
    },
    {
      "title": "Reply to Sarah's email",
      "priority": "urgent",
      "estimatedDuration": 10,
      "dueDate": null,
      "category": "Communication",
      "subtasks": [],
      "userContext": "User flagged as urgent",
      "aiNotes": null,
      "ambiguous": false,
      "clarificationPrompt": null,
      "source": "direct"
    }
  ]
}
```

### Example — after clarification round

**Clarification history passed as context:**

```json
{
  "originalInput": "Get taxes sorted",
  "clarificationHistory": [
    {
      "prompt": "This looks like it might involve a few steps — want me to break it down?",
      "userResponse": "yes, and I also need to find an accountant"
    }
  ]
}
```

**AI output:**

```json
{
  "tasks": [
    {
      "title": "Gather tax documents",
      "priority": "high",
      "estimatedDuration": 30,
      "dueDate": null,
      "category": "Finance",
      "subtasks": ["Locate W-2s", "Find receipts", "Download bank statements"],
      "userContext": "Part of 'get taxes sorted'",
      "aiNotes": null,
      "ambiguous": false,
      "clarificationPrompt": null,
      "source": "clarified"
    },
    {
      "title": "Find an accountant",
      "priority": "high",
      "estimatedDuration": 20,
      "dueDate": null,
      "category": "Finance",
      "subtasks": ["Ask for referrals", "Compare reviews", "Book a consultation"],
      "userContext": "User added this during clarification",
      "aiNotes": null,
      "ambiguous": false,
      "clarificationPrompt": null,
      "source": "clarified"
    }
  ]
}
```

---

## Project Structure

```
aura/
├── app/
│   ├── api/
│   │   ├── parse-tasks/
│   │   │   └── route.ts          # AI task parsing endpoint
│   │   ├── clarify/
│   │   │   └── route.ts          # Clarifying intelligence endpoint
│   │   └── tasks/
│   │       └── route.ts          # CRUD for persisted tasks
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (app)/
│   │   ├── page.tsx              # Main task dashboard
│   │   ├── focus/page.tsx        # Focus mode
│   │   └── layout.tsx
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── ui/                       # Primitives (Button, Badge, Card, etc.)
│   ├── TaskInput.tsx             # The main free-form text input
│   ├── TaskCard.tsx              # Individual task card component
│   ├── TaskList.tsx              # Task list container with sorting
│   ├── ClarificationCard.tsx     # Inline clarification prompt component
│   ├── FocusView.tsx             # Full-screen focus mode component
│   ├── CompletionAnimation.tsx   # Quick win celebration animation
│   └── NudgeBanner.tsx           # Gentle nudge notification component
│
├── lib/
│   ├── ai.ts                     # AI provider client (OpenAI or Anthropic)
│   ├── supabase.ts               # Supabase client setup
│   ├── prompts.ts                # AI system prompt definitions
│   ├── personalization.ts        # User pattern learning utilities
│   └── utils.ts                  # Shared utilities
│
├── store/
│   └── tasks.ts                  # Zustand store for task state
│
├── types/
│   └── task.ts                   # Task and related TypeScript types
│
├── hooks/
│   ├── useTasks.ts               # Task CRUD hook
│   ├── useClarification.ts       # Clarification flow state hook
│   └── useFocusMode.ts           # Focus mode state hook
│
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic API](https://console.anthropic.com) key

### Setup

```bash
# Clone the repo
git clone https://github.com/your-org/aura.git
cd aura

# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# AI Provider — set one or both, then set AI_PROVIDER to your preference
AI_PROVIDER=openai # or "anthropic"
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

```bash
# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start typing.

For linting, formatting, pre-commit hooks, and testing setup, see [DEVELOPMENT.md](./docs/DEVELOPMENT.md).

---

## Deployment

For deployment instructipns, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## Roadmap

### v1.0 — MVP

- [ ] Free-form text input
- [ ] AI task parsing via AI provider
- [ ] Task card UI with priority, duration, category
- [ ] Task View — clean, uncluttered default list sorted by urgency
- [ ] Mark tasks complete with animation
- [ ] In-memory state (Zustand, no persistence)

### v1.1 — Quality of Life

- [ ] Focus Mode (single-task full-screen view)
- [ ] Local storage persistence (tasks survive page refresh)
- [ ] Manual task editing
- [ ] Task reordering via drag-and-drop

### v1.2 — Clarifying Intelligence

- [ ] Ambiguity detection in parsed input (`ambiguous` flag in data model)
- [ ] Inline clarification card UI beneath input
- [ ] `/api/clarify` endpoint
- [ ] Suggested task selection and confirmation flow
- [ ] User-controlled clarification — refine as many times as needed
- [ ] `clarificationHistory` passed as context for multi-round refinement
- [ ] `source` field tracked on all tasks (direct vs. clarified)

### v2.0 — Accounts & Cloud

- [ ] User authentication (magic link or social login — low friction, no passwords)
- [ ] Cloud task persistence
- [ ] Cross-device sync
- [ ] Gentle browser/email reminders

### v2.1 — Personalization

- [ ] User pattern learning (categories, time estimates, urgency signals)
- [ ] User pattern context passed into AI system prompt at parse time
- [ ] Task history and completion stats

### v2.2 — Integrations

- [ ] Recurring tasks
- [ ] Google Calendar sync
- [ ] Task export

### Future Vision

- 📱 Native mobile app (React Native)
- 🎙️ Voice input (speak your brain dump)
- 📊 Habit tracking and streak visualization

---

## License

MIT © Aura Contributors

---

_Built with care for brains that work differently. 🧠✨_
