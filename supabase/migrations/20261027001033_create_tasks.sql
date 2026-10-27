-- Tasks belong to a Clerk user. RLS is the user boundary: signed-in users can reach the Data API
-- directly with their own token, so every rule that matters lives here, not in the API routes.

-- Keep in sync with PRIORITIES in src/types/task.ts (checked by a test).
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  -- Clerk user ID from the session token. Text with no foreign key: users live in Clerk.
  user_id text not null default (auth.jwt() ->> 'sub'),
  -- Insertion order. Nothing reads it yet, but it can't be backfilled if added later.
  seq bigint generated always as identity,
  title text not null,
  priority public.task_priority not null,
  -- Minutes.
  estimated_duration integer not null check (estimated_duration >= 0),
  -- Calendar date the user plans for, not an instant.
  due_date date,
  category text not null,
  -- text[] rather than jsonb so the generated type is string[].
  subtasks text[] not null default '{}',
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index tasks_user_id_completed_at_idx on public.tasks (user_id, completed_at);

alter table public.tasks enable row level security;

-- Supabase grants anon and authenticated everything on new public tables. Start from nothing:
-- anon gets no access, TRUNCATE (which ignores RLS) is never granted, and updates are limited to
-- the editable columns so id, user_id, seq and created_at can't be rewritten.
revoke all on table public.tasks from anon, authenticated;
grant select, insert, delete on table public.tasks to authenticated;
grant update (
  title,
  priority,
  estimated_duration,
  due_date,
  category,
  subtasks,
  notes,
  completed_at
) on table public.tasks to authenticated;

-- `(select auth.jwt() ->> 'sub')` is evaluated once per query rather than once per row.
create policy "Users can read their own tasks"
  on public.tasks for select
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));

create policy "Users can create their own tasks"
  on public.tasks for insert
  to authenticated
  with check (user_id = (select auth.jwt() ->> 'sub'));

-- Checks the old row and the new one, so a task can't be moved to another user.
create policy "Users can update their own tasks"
  on public.tasks for update
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));

-- Hard delete.
create policy "Users can delete their own tasks"
  on public.tasks for delete
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));
