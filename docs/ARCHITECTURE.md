# System Architecture

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
│  3. Call AI provider                             │
│  4. Parse & validate JSON response               │
│  5. Detect ambiguity — needs clarification?      │
└──────────┬──────────────────────┬────────────────┘
           │ No                   │ Yes
           │              ┌───────▼────────────────┐
           │              │  POST /api/clarify      │
           │              │                         │
           │              │  Returns suggested      │
           │              │  tasks + prompt         │
           │              └───────┬────────────────┘
           │                      │ User confirms inline
           │              ┌───────▼────────────────┐
           │              │  Browser: Clarification │
           │              │  card shown beneath     │
           │              │  input — one round max  │
           │              └───────┬────────────────┘
           │                      │ Confirmed
           └──────────────────────┘
                  │ Structured tasks
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
