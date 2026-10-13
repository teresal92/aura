import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test, expect, type Locator, type Page } from '@playwright/test'

// Clerk's fixed OTP for any "+clerk_test" email address in a dev instance — no real
// mail is sent, so this is safe to hardcode.
const CLERK_TEST_OTP = '424242'

const existingEmail = requireEnv('E2E_CLERK_TEST_EMAIL')
const existingPassword = requireEnv('E2E_CLERK_TEST_PASSWORD')

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var ${name} — see .env.example`)
  }
  return value
}

// A fresh "+clerk_test" address per run so the sign-up test doesn't collide with an
// account created by a previous run.
function uniqueClerkTestEmail(): string {
  return `e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}+clerk_test@testemail.com`
}

// The Clerk modal can take a beat to mount on the very first interaction after a cold
// page load (seen in manual testing — the first click fires Clerk's setup calls but the
// dialog doesn't render yet). Retry the click once if the dialog hasn't appeared.
async function openAuthModal(page: Page, buttonName: 'Sign in' | 'Sign up') {
  const button = page.getByRole('button', { name: buttonName, exact: true })
  const dialog = page.getByRole('dialog')

  await button.click()
  try {
    await dialog.waitFor({ state: 'visible', timeout: 3000 })
  } catch {
    await button.click()
    await dialog.waitFor({ state: 'visible' })
  }

  return dialog
}

// Completes the email + password steps of the sign-in modal. Clerk sometimes adds an
// extra "verify this device" email-code step for a browser/context it hasn't seen
// before — every fresh Playwright context looks like a new device, so this happens on
// effectively every CI run even though it didn't appear in manual testing (same browser
// profile reused there). Handle it when Clerk asks for it, skip it when it doesn't.
async function signInWithPassword(page: Page, dialog: Locator, email: string, password: string) {
  await dialog.getByRole('textbox', { name: 'Email address' }).fill(email)
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click()

  await expect(dialog.getByRole('heading', { name: 'Enter your password' })).toBeVisible()
  await dialog.getByRole('textbox', { name: 'Password' }).fill(password)
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click()

  const userMenuButton = page.getByRole('button', { name: 'Open user menu' })
  const deviceCheck = dialog.getByRole('heading', { name: 'Check your email' })
  await expect(userMenuButton.or(deviceCheck)).toBeVisible()

  if (await deviceCheck.isVisible()) {
    await dialog.getByRole('textbox', { name: 'Enter verification code' }).fill(CLERK_TEST_OTP)
    await expect(userMenuButton).toBeVisible()
  }
}

test.describe('sign in / sign up', () => {
  test.beforeEach(async ({ page }) => {
    // Bypasses Clerk's Cloudflare Turnstile bot check, which otherwise replaces the
    // sign-up form with an interactive "Verify you are human" challenge for automated
    // browsers. Uses the Testing Token obtained by the "setup" project (see
    // e2e/global.setup.ts) — a first-party Clerk mechanism for e2e tests, not a bypass
    // of real user protection.
    await setupClerkTestingToken({ page })
    await page.goto('/')
  })

  test('signed-out visitor sees Sign in and Sign up buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign up', exact: true })).toBeVisible()
  })

  test('signs up with a new account via email + password', async ({ page }) => {
    const dialog = await openAuthModal(page, 'Sign up')

    await expect(dialog.getByRole('heading', { name: 'Create your account' })).toBeVisible()

    await dialog.getByRole('textbox', { name: 'Email address' }).fill(uniqueClerkTestEmail())
    await dialog.getByRole('textbox', { name: 'Password' }).fill(existingPassword)
    await dialog.getByRole('button', { name: 'Continue', exact: true }).click()

    await expect(dialog.getByRole('heading', { name: 'Verify your email' })).toBeVisible()

    // Filling all six digits auto-submits — no "Continue" click needed.
    await dialog.getByRole('textbox', { name: 'Enter verification code' }).fill(CLERK_TEST_OTP)

    await expect(page.getByRole('button', { name: 'Open user menu' })).toBeVisible()
    await expect(dialog).not.toBeVisible()
  })

  test('signs in with an existing account', async ({ page }) => {
    const dialog = await openAuthModal(page, 'Sign in')

    await expect(dialog.getByRole('heading', { name: 'Sign in to Aura' })).toBeVisible()

    await signInWithPassword(page, dialog, existingEmail, existingPassword)

    await expect(dialog).not.toBeVisible()
  })

  test('signs out and returns to the signed-out header', async ({ page }) => {
    const dialog = await openAuthModal(page, 'Sign in')
    await signInWithPassword(page, dialog, existingEmail, existingPassword)

    const userMenuButton = page.getByRole('button', { name: 'Open user menu' })
    await userMenuButton.click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()

    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign up', exact: true })).toBeVisible()
  })
})
