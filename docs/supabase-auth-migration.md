# Supabase Auth Migration Plan (Toy Project)

Context: This was a planning exercise for migrating from Clerk to Supabase Auth in Aura. We decided to keep Clerk for now. This document captures the proposed migration plan in case we revisit it later.

## Assumptions

- Toy project
- Supabase DB
- Magic link only
- Basic user auth
- Acceptable to treat existing users as new signups

## Proposed Migration Checklist (Repo-Specific)

1. Decide minimal auth UX

- Replace Clerk UI (sign in/up modal + user avatar) with: `Sign in` (magic link), `Sign out`, optional user email display.

2. New dependencies (requires approval)

- Add Supabase client packages: `@supabase/supabase-js` and `@supabase/ssr` (or `@supabase/auth-helpers-nextjs` if preferred).
- Remove `@clerk/nextjs`.

3. Environment variables

- Add to `.env.example` and README:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Optional `SUPABASE_SERVICE_ROLE_KEY`
- Remove Clerk env var instructions from README.

4. App layout

- `src/app/layout.tsx`: remove `ClerkProvider`; add Supabase provider if we use one.

5. Home page UI

- `src/app/page.tsx`: replace Clerk components (`SignedIn`, `SignedOut`, `SignInButton`, `SignUpButton`, `UserButton`) with Supabase sign in/sign out UI.

6. Auth-aware input

- `src/components/TaskInput.tsx`: replace Clerk hooks and sign-in flow with Supabase magic link.
- Preserve the “pending input” behavior on auth.

7. Server auth for API

- `src/app/api/parse-tasks/route.ts`: replace `auth()` with Supabase server session validation. Keep 401 when unauthenticated.

8. Middleware

- `src/proxy.ts` is Clerk middleware and doesn’t appear wired into Next. Decide whether to:
- Remove entirely, or
- Replace with Supabase middleware at `src/middleware.ts`.

9. Supabase auth callback route

- Add `src/app/auth/callback/route.ts` to exchange code for session and redirect.

10. Cleanup

- Remove Clerk references in `README.md` and docs.
- Remove Clerk dependency from `package.json`.

## Open Decisions (If We Revisit)

1. Supabase helper choice: `@supabase/ssr` (newer) vs `@supabase/auth-helpers-nextjs` (older).
2. Keep middleware guard or rely on API route checks only.
3. Auth UX: inline email input vs modal.
