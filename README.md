# Aura

> Turn a brain dump into a clear next step.

Aura is a minimal AI task app for when everything you need to do is in your head at once.

Instead of asking you to organize first, Aura lets you type the messy version:

```text
laundry today, dentist on Friday, reply to Sarah because that's urgent
```

Aura turns that into prioritized tasks:

```text
⚡ Reply to Sarah      · Urgent · ~5 min · Communication
✅ Do laundry          · Mon, Oct 19 · ~45 min · Home
📅 Dentist appointment · Fri, Oct 23 · Health
```

## How it works

- **One input, anything goes.** Brain dumps, half-formed reminders, messy plans. If something's vague, Aura asks a short follow-up instead of guessing.
- **Only what you need.** Priority, category, and time cues appear when they help and stay out of the way when they don't.
- **Support that flexes.** Keep it high level, or have Aura break a bigger task into steps.

No onboarding, no tutorial. If you can type a sentence, you can use it.

## Run It Locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Set the provider you want in `.env.local`:

```env
AI_PROVIDER=openai

OPENAI_API_KEY=
OPENAI_MODEL=

ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
```

Open `http://localhost:3000`.

## Database

One-time setup:

```bash
pnpm exec supabase login
pnpm db:link   # pick aura-dev
```

To change the schema:

```bash
pnpm db:new create_tasks   # creates supabase/migrations/<timestamp>_create_tasks.sql
# write the SQL
pnpm db:push               # applies new migrations to the linked project
pnpm db:types              # regenerates src/types/database.ts
```

Commit the migration and `src/types/database.ts` together.

`db:push` signs in with your Supabase login. On some projects it fails with `permission denied to alter role "cli_login_postgres"` ([supabase/cli#5091](https://github.com/supabase/cli/issues/5091)). If it does, pass the database password from Project Settings → Database for that one command:

```bash
read -rs PW   # type the password; nothing is shown
SUPABASE_DB_PASSWORD=$PW pnpm db:push
unset PW
```

Don't save the password in `.env*`.

## License

MIT
