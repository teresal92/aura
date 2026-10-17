# Sign-in / sign-up flow notes (Playwright walkthrough)

Manual walkthrough of the Clerk auth flow on `localhost:3000`, done via Playwright MCP tools
on 2026-09-01, to inform an e2e test. Not committed — local scratch notes only.

## Structure

No dedicated `/sign-in` route or middleware redirect — everything is a Clerk modal
(`mode="modal"`) triggered from buttons in the home page header (`src/app/page.tsx`).
`SignedIn`/`SignedOut` wrappers swap header content; unauthenticated users can still see
the full home page (task input etc. is just non-functional without an account).

## Page states / selectors

| State                              | Key selectors                                                                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signed out                         | `button[name="Sign in"]`, `button[name="Sign up"]`                                                                                                                                                |
| Sign-up form                       | `dialog`, heading "Create your account", `textbox[name="Email address"]`, `textbox[name="Password"]`, optional First/Last name, "Continue with Google"                                            |
| Sign-up → email verify             | heading "Verify your email", single `textbox[name="Enter verification code"]` (renders as one field despite a `group` wrapper, not per-digit boxes), disabled "Resend (29)" button with countdown |
| Sign-in form (step 1)              | heading "Sign in to Aura", `textbox[name="Email address"]` (shows a "Last used" hint on repeat visits)                                                                                            |
| Sign-in (step 2, existing account) | heading "Enter your password", separate step after email is submitted, "Forgot password?" link, "Use another method" link                                                                         |
| Signed in                          | `button[name="Open user menu"]` → popover with account email, "Manage account", "Sign out"                                                                                                        |

Verification code auto-submits once all 6 digits are filled — no need to click "Continue"
after filling it.

## Assertions worth having

- Modal `role="dialog"` appears/disappears
- Header swaps Sign in/Sign up buttons ↔ user menu button
- Email-verification and password steps show the target email as read-only text with an "Edit" affordance
- Sign out returns to signed-out header state

## Flakiness / inconsistencies found

1. **First-interaction modal delay**: on a cold page load, the _first_ click on "Sign in"
   fired Clerk's network setup (`environment`/`client` calls) but didn't render the dialog —
   needed a second click. Only reproduced on the very first Clerk interaction after page
   load; sign-up and later sign-in modals opened on click #1 in the same session. Tests
   should `waitFor` the dialog role rather than assume instant render.
2. **Duplicate error text nodes**: "Couldn't find your account" and the breach-password
   error each render twice in the DOM (visible text + a live-region echo) — use `.first()`
   or a scoped locator, not a bare `getByText`.
3. **Console "errors" that aren't real failures**: Cloudflare Turnstile (Clerk's bot-check)
   logs benign debug lines via `console.error`, and Clerk's expected 422s (bad password, no
   account) also show as console errors. Don't assert "zero console errors" blindly —
   filter to real app-code errors if that check is ever added.
4. **Password breach-check is live**: `TestPassword123!` was rejected as breached
   ("found as part of a breach"). Any hardcoded test password needs to be genuinely
   uncommon, not a textbook example.
5. **`+clerk_test` convention required for CI**: a plain fake email (e.g.
   `foo@testemail.com`) enters a real "waiting for emailed code" state that never resolves
   in automation. Use `<name>+clerk_test@<domain>` — Clerk skips sending real mail and
   accepts the fixed OTP `424242`.
6. **"Forgot password?" link has `href=""`** in the accessibility tree — worth a quick
   manual check that it's wired to a JS handler and not a dead link. Not exercised in this
   walkthrough.

## Test credentials

A Clerk test-mode account exists for e2e use:

- Email: `E2E_CLERK_TEST_EMAIL` in `.env.local` (a `+clerk_test` address)
- Password: `E2E_CLERK_TEST_PASSWORD` in `.env.local`
- OTP for `+clerk_test` addresses is always `424242` (public Clerk convention, safe to
  hardcode in tests)

Do not hardcode the actual email/password in test files or commit them anywhere — read
from `process.env`. See `.env.example` for the variable names.
