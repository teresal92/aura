-- Manual RLS smoke test for public.tasks. Paste into the Supabase SQL editor for aura-dev and run
-- it all at once. Everything happens in one transaction that ends in a rollback, so no rows are kept.
-- Any failed check raises an error; a clean run ends by selecting 'RLS smoke test passed'.
--
-- Acts as two fake Clerk users by setting the role and the JWT claims that auth.jwt() reads.

begin;

-- user_a creates two tasks: user_id comes from the token and seq increases.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"user_a","role":"authenticated"}', true);

do $$
declare
  first public.tasks;
  second public.tasks;
begin
  insert into public.tasks (title, priority, estimated_duration, category)
    values ('smoke A1', 'low', 10, 'Home') returning * into first;
  insert into public.tasks (title, priority, estimated_duration, category)
    values ('smoke A2', 'high', 20, 'Work') returning * into second;
  assert first.user_id = 'user_a', 'user_id was not filled from the token';
  assert second.seq > first.seq, 'seq did not increase';
end $$;

-- user_a can't create a task for someone else.
do $$
begin
  insert into public.tasks (user_id, title, priority, estimated_duration, category)
    values ('user_b', 'smoke forged', 'low', 5, 'Home');
  raise exception 'inserting a task for another user succeeded';
exception when insufficient_privilege then null;
end $$;

-- user_b sees none of user_a's tasks and can't change or delete them.
select set_config('request.jwt.claims', '{"sub":"user_b","role":"authenticated"}', true);

do $$
declare
  n integer;
begin
  select count(*) into n from public.tasks where title like 'smoke %';
  assert n = 0, format('user_b can see %s of user_a''s tasks', n);

  update public.tasks set title = 'hijacked' where title like 'smoke %';
  get diagnostics n = row_count;
  assert n = 0, format('user_b updated %s of user_a''s tasks', n);

  delete from public.tasks where title like 'smoke %';
  get diagnostics n = row_count;
  assert n = 0, format('user_b deleted %s of user_a''s tasks', n);
end $$;

-- Back to user_a.
select set_config('request.jwt.claims', '{"sub":"user_a","role":"authenticated"}', true);

-- user_a can edit title and completed_at.
do $$
declare
  n integer;
begin
  update public.tasks set title = 'smoke A1 edited', completed_at = now() where title = 'smoke A1';
  get diagnostics n = row_count;
  assert n = 1, format('user_a''s own update affected %s rows', n);
end $$;

-- user_a can't move a task to another user, or rewrite created_at or seq.
do $$
begin
  update public.tasks set user_id = 'user_b' where title = 'smoke A2';
  raise exception 'moving a task to another user succeeded';
exception when insufficient_privilege then null;
end $$;

do $$
begin
  update public.tasks set created_at = '2000-01-01' where title = 'smoke A2';
  raise exception 'updating created_at succeeded';
exception when insufficient_privilege then null;
end $$;

do $$
begin
  update public.tasks set seq = 1 where title = 'smoke A2';
  raise exception 'updating seq succeeded';
-- 428C9: an identity column can only be updated to DEFAULT.
exception when insufficient_privilege or sqlstate '428C9' then null;
end $$;

-- Column rules: estimated_duration can't be negative; priority must be a known value.
do $$
begin
  insert into public.tasks (title, priority, estimated_duration, category)
    values ('smoke negative', 'low', -1, 'Home');
  raise exception 'a negative estimated_duration was accepted';
exception when check_violation then null;
end $$;

do $$
begin
  insert into public.tasks (title, priority, estimated_duration, category)
    values ('smoke bad priority', 'critical', 5, 'Home');
  raise exception 'an unknown priority was accepted';
exception when invalid_text_representation then null;
end $$;

-- user_a can delete their own task (a hard delete).
do $$
declare
  n integer;
begin
  delete from public.tasks where title = 'smoke A2';
  get diagnostics n = row_count;
  assert n = 1, format('user_a''s own delete affected %s rows', n);
end $$;

-- TRUNCATE ignores RLS, so authenticated must not have it.
do $$
begin
  truncate public.tasks;
  raise exception 'authenticated can truncate tasks';
exception when insufficient_privilege then null;
end $$;

-- Anonymous requests have no access.
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
declare
  n integer;
begin
  select count(*) into n from public.tasks;
  raise exception 'anon can read tasks (% rows)', n;
exception when insufficient_privilege then null;
end $$;

select 'RLS smoke test passed' as result;

rollback;
