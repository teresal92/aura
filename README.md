# 🌟 Aura

> *Your thoughts, organized. Your tasks, simplified. Your brain, supported.*

Aura is an AI-powered todo app built for minds that work in bursts, get lost in the planning, or forget things exist until they're urgent. Instead of forcing you into rigid forms and overwhelming lists, Aura lets you just *talk* — type whatever's swirling around in your head — and it does the heavy lifting of turning that chaos into calm, structured tasks.

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

Most task management apps assume you've already done the hard part. They expect you to arrive knowing what needs doing, in what order, by when, and how long each thing will take. For a lot of people — especially those who think in bursts, get paralyzed by open-ended choices, or lose the thread between "I should do this" and actually starting — that planning step *is* the hard part.

Aura removes it. The cognitive work of breaking down, categorizing, and prioritizing tasks gets handed off to AI, so your brain can focus on actually doing things instead of agonizing over how to organize them.

It's built especially with **ADD/ADHD and other attention-diverse minds** in mind — but honestly, if you've ever stared at a blank task list and felt nothing, Aura is for you.

---

## Who Aura Is For

Aura is designed for people who recognize themselves in any of these:

- You know you have things to do, but can't figure out where to start
- You underestimate how long tasks take, then feel overwhelmed when they pile up
- You need external structure to prioritize — your brain doesn't do it automatically
- A cluttered or busy UI makes you close the app entirely
- You're great at *doing* things, but the planning and organizing part feels like a separate, exhausting job

These experiences are especially common in people with **ADD/ADHD and other attention-diverse or neurodivergent profiles** — and that's who Aura was specifically designed with in mind. But you don't need a diagnosis to benefit. If the description above resonates, Aura was made for you.

## Design Philosophy

Every design decision in Aura is guided by these principles:

**Minimal cognitive load** — If it's not necessary right now, it's not on screen right now. No sidebar menus, no settings panels bleeding into your workspace, no notification badges demanding attention.

**Progressive disclosure** — Task cards show only the essentials. Tap to reveal subtasks, notes, or metadata. You choose how deep to go.

**Forgiving input** — There's one input. It accepts anything. Typos, half-formed thoughts, overly casual language — all fine. The AI figures it out.

**Dopamine-friendly feedback** — Completing a task feels good. Not obnoxiously animated, not underwhelming — just enough to make your brain say *yes, more of that*.

**Clear visual hierarchy** — The most urgent thing looks most urgent. Not through red warning labels that spike anxiety, but through thoughtful use of typography, weight, and color.

**Distraction-resistant** — Aura does not have dark patterns, infinite scroll, engagement metrics, or anything designed to keep you *in* the app longer than you need to be.

---

## Core Features

### 🗣️ Free-Form AI Input
A single, inviting text area at the top of the app. Type your day, your week, a brain dump, a half-remembered obligation — whatever's in your head. Hit enter. Done.

### 🧠 AI Task Parsing
Behind the scenes, the AI extracts structured task objects from your input. Each task gets:

| Field | Description |
|---|---|
| `title` | Clean, concise task name |
| `priority` | `low` / `medium` / `high` / `urgent` |
| `estimatedDuration` | Time estimate in minutes |
| `dueDate` | Parsed from natural language if mentioned |
| `category` | Auto-tagged (Home, Work, Health, Communication, etc.) |
| `subtasks` | Array of smaller steps for complex tasks |
| `notes` | Any relevant context extracted from input |

### 🃏 Smart Task Cards
Tasks are rendered as clean, minimal cards. The default view shows only the title, priority badge, and estimated time. Everything else is a tap away. No walls of text, no overwhelming detail.

### 🎯 Focus Mode
One task. Full screen. Nothing else. Focus Mode strips away the task list entirely and presents a single task with a gentle timer and a big, satisfying completion button. For when you're ready to work and need the world to disappear.

### 🔔 Gentle Nudges
Optional, non-intrusive reminders. No aggressive push notifications, no red badges, no anxiety-inducing "YOU HAVE 14 OVERDUE TASKS" banners. Just a soft prompt: *"Hey, you had laundry on your list — still need to do that?"*

### 🎉 Quick Wins
Completing a task triggers a small, delightful animation — confetti, a satisfying checkmark, a warm color flash. Calibrated to be rewarding without being distracting. Your brain gets its hit; your workflow continues.

---

## Tech Stack

We evaluated CRA, Vite, Next.js, and Remix — Next.js won for its API routes, Vercel-native deployment, and ability to ship the frontend and backend proxy as a single unit. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full breakdown.

### Recommended Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | Next.js (App Router) | API routes, Vercel-native, excellent DX |
| **Styling** | Tailwind CSS | Utility-first makes it easy to enforce the clean, minimal aesthetic consistently; excellent for responsive design |
| **State Management** | Zustand | Lightweight, minimal boilerplate, no provider hell — React Context would get messy fast; Redux Toolkit is overkill |
| **AI Integration** | OpenAI or Anthropic (via Next.js API route) | Both support structured JSON output and are swappable behind the API route — see [AI Provider](#ai-provider) |
| **Database** | Supabase | Postgres-backed, real-time capable, built-in auth, generous free tier, great DX |
| **Auth** | Supabase Auth | Comes with Supabase; supports magic links (lower friction than passwords — one less thing to forget) |

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                  Browser (React)                 │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Free-form text input                    │   │
│  │  "I need to do laundry and call my mom"  │   │
│  └──────────────┬───────────────────────────┘   │
│                 │ POST /api/parse-tasks           │
└─────────────────┼───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│             Next.js API Route                    │
│         (/app/api/parse-tasks/route.ts)          │
│                                                  │
│  1. Validate & sanitize input                    │
│  2. Build prompt with system instructions        │
│  3. Call Anthropic API                           │
│  4. Parse & validate JSON response               │
│  5. Return structured task array                 │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────▼──────────┐
        │   Anthropic API    │
        │  (claude-3-5-      │
        │   sonnet)          │
        └─────────┬──────────┘
                  │ Structured JSON
┌─────────────────▼───────────────────────────────┐
│             Next.js API Route                    │
│                                                  │
│  6. Persist tasks to Supabase                    │
│  7. Return tasks to client                       │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│                  Browser (React)                 │
│                                                  │
│  Zustand store updated → Task cards rendered     │
│  User interacts: complete, focus, edit, delete   │
└─────────────────────────────────────────────────┘
```

---

## AI Provider

Aura's AI layer is intentionally provider-agnostic. The task parsing logic lives behind a single Next.js API route (`/api/parse-tasks`), so swapping providers is a one-file change. Both of the following are well-supported:

| Provider | Model | Strengths for Aura |
|---|---|---|
| **OpenAI** | `gpt-4o` / `gpt-4o-mini` | Native `json_object` response format enforcement; `gpt-4o-mini` is very cost-effective for short parsing tasks |
| **Anthropic** | `claude-sonnet-4-5` | Excellent at interpreting ambiguous, casual, stream-of-consciousness input; strong instruction-following for nuanced system prompts |

Set your preferred provider via environment variables — see [Getting Started](#getting-started). The system prompt below works with both.

## AI Prompt Design

### System Prompt

```
You are a task extraction assistant for a todo app designed for people who struggle with
task planning and prioritization.

Your job is to take a user's free-form, stream-of-consciousness input and extract a 
structured list of tasks from it.

Rules:
- Extract every distinct task or obligation mentioned, no matter how casually
- Use simple, action-oriented titles (verb + object: "Call Mom", "Do laundry")
- Be generous with priority assignment — if something sounds time-sensitive or causes 
  the user stress, bump it up
- Estimate duration conservatively and realistically
- If a task is complex (more than ~30 mins), suggest 2-4 subtasks
- Infer categories from context: Home, Work, Health, Communication, Finance, Personal
- If no due date is mentioned, omit the field — don't invent dates
- Return ONLY valid JSON. No preamble, no explanation.

Response format:
{
  "tasks": [
    {
      "title": "string",
      "priority": "low" | "medium" | "high" | "urgent",
      "estimatedDuration": number (minutes),
      "dueDate": "ISO 8601 string" | null,
      "category": "string",
      "subtasks": ["string"] | [],
      "notes": "string" | null
    }
  ]
}
```

### Example

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
      "notes": null
    },
    {
      "title": "Dentist appointment",
      "priority": "medium",
      "estimatedDuration": 60,
      "dueDate": null,
      "category": "Health",
      "subtasks": [],
      "notes": "User mentioned 'this week' — may need to check and confirm actual appointment time"
    },
    {
      "title": "Reply to Sarah's email",
      "priority": "urgent",
      "estimatedDuration": 10,
      "dueDate": null,
      "category": "Communication",
      "subtasks": [],
      "notes": "User flagged as urgent"
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
│   ├── FocusView.tsx             # Full-screen focus mode component
│   ├── CompletionAnimation.tsx   # Quick win celebration animation
│   └── NudgeBanner.tsx           # Gentle nudge notification component
│
├── lib/
│   ├── ai.ts                     # AI provider client (OpenAI or Anthropic)
│   ├── supabase.ts               # Supabase client setup
│   ├── prompts.ts                # AI system prompt definitions
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
│   └── useFocusMode.ts           # Focus mode state hook
│
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Server/Client Boundaries (Next.js App Router)

The App Router defaults to Server Components. We keep the boundary explicit with clear folders and `server-only` enforcement.

### Separation Rules

- Server Components are the default in `app/`. Only add `"use client"` where interactivity is needed.
- Server-only modules live in `lib/server/*` and must import `server-only`.
- Client-only modules live in `lib/client/*` and must never import server-only code.
- Shared modules live in `lib/shared/*` and must be pure (no `window`, no `process.env`, no DB).

### Example Structure

```
app/
  todos/
    page.tsx           # Server Component (data fetching)
    TodoList.tsx       # Server Component
    TodoClient.tsx     # Client Component ("use client")
  actions/
    todos.ts           # Server Actions ("use server")
  api/
    todos/route.ts     # API route (server)
lib/
  server/
    db.ts              # DB client (server-only)
    ai.ts              # AI provider calls (server-only)
  client/
    toast.tsx          # Client utilities
  shared/
    types.ts           # Shared types
```

### Enforce Server-Only Imports

```ts
// lib/server/db.ts
import "server-only";
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
```

### Example Flow (Server → Client → Server)

1. Server Component loads initial data.
2. Client Component handles interaction.
3. Client calls a Server Action to persist.

```tsx
// app/todos/page.tsx (server)
import { db } from "@/lib/server/db";
import TodoClient from "./TodoClient";

export default async function TodosPage() {
  const todos = await db.todo.findMany();
  return <TodoClient initialTodos={todos} />;
}
```

```tsx
// app/todos/TodoClient.tsx (client)
"use client";
import { useState } from "react";
import { addTodo } from "@/app/actions/todos";
import type { Todo } from "@/lib/shared/types";

export default function TodoClient({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos);

  async function onAdd(title: string) {
    const created = await addTodo(title);
    setTodos((prev) => [created, ...prev]);
  }

  return (
    <div>
      <button onClick={() => onAdd("New task")}>Add</button>
      {todos.map((t) => (
        <div key={t.id}>{t.title}</div>
      ))}
    </div>
  );
}
```

```ts
// app/actions/todos.ts (server action)
"use server";
import { db } from "@/lib/server/db";

export async function addTodo(title: string) {
  return db.todo.create({ data: { title } });
}
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
npm install

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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start typing.

---

## Deployment

Moved to [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Roadmap

### v1.0 — MVP
- [ ] Free-form text input
- [ ] AI task parsing via Anthropic API
- [ ] Task card UI with priority, duration, category
- [ ] Mark tasks complete with animation
- [ ] In-memory state (Zustand, no persistence)

### v1.1 — Quality of Life
- [ ] Focus Mode (single-task full-screen view)
- [ ] Local storage persistence (tasks survive page refresh)
- [ ] Manual task editing
- [ ] Task reordering via drag-and-drop

### v2.0 — Accounts & Cloud
- [ ] Supabase auth (magic link login)
- [ ] Cloud task persistence
- [ ] Cross-device sync
- [ ] Gentle browser/email reminders

### v2.1 — Power Features
- [ ] Recurring tasks
- [ ] Google Calendar integration
- [ ] Task history and completion stats
- [ ] Subtask progress tracking

### Future Vision
- 📱 Native mobile app (React Native)
- 🎙️ Voice input (speak your brain dump)
- 📊 Habit tracking and streak visualization
- 🤝 Accountability buddy features
- 🧘 "Brain dump" mode — just offload everything, sort later

---


## License

MIT © Aura Contributors

---

*Built with care for brains that work differently. 🧠✨*
