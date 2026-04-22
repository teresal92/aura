# Development Guide

This document covers the developer setup for Aura — linting, formatting, pre-commit hooks, and testing. Following these conventions keeps the codebase consistent and catches issues before they reach production.

---

## Linting & Formatting

Aura uses **ESLint** for code quality and **Prettier** for formatting. They serve different purposes and work together — ESLint catches logical and structural issues, Prettier enforces a consistent code style so you never argue about it again.

### ESLint

Next.js ships with ESLint pre-configured. Aura uses the **flat config** format in `eslint.config.mjs` and extends it with a few additional rules.

**Install:**

```bash
pnpm add -D eslint eslint-config-next @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

**`eslint.config.mjs`:**

```js
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-console': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  prettier,
])
```

**Run manually:**

```bash
pnpm lint
```

---

### Prettier

**Install:**

```bash
pnpm add -D prettier eslint-config-prettier
```

> `eslint-config-prettier` disables any ESLint rules that would conflict with Prettier — always include it.

**`.prettierrc`:**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

**`.prettierignore`:**

```
.next
node_modules
public
```

**Run manually:**

```bash
# Check for formatting issues
pnpm exec prettier --check .

# Fix formatting issues
pnpm exec prettier --write .
```

Add Prettier to your ESLint config to avoid conflicts:

```js
// eslint.config.mjs (already included in this repo)
import prettier from 'eslint-config-prettier'
```

---

## Pre-Commit Hooks

Aura uses **Husky** and **lint-staged** to enforce linting and formatting automatically on every commit. This means formatting issues and lint errors never make it into the repo.

### Setup

**Install:**

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

This creates a `.husky/` directory with a `pre-commit` hook file.

**Configure the pre-commit hook** (`.husky/pre-commit`):

```bash
pnpm exec lint-staged
```

**Configure lint-staged** in `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

### How it works

When you run `git commit`, Husky triggers lint-staged, which runs ESLint and Prettier only against the files you've staged — not the entire codebase. This keeps the pre-commit hook fast.

If ESLint finds an error it can't auto-fix, the commit will be blocked until you resolve it. This is intentional.

---

## Testing

Aura uses three complementary testing tools:

| Tool                      | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| **Vitest**                | Unit tests for utilities, hooks, and pure functions |
| **React Testing Library** | Component behaviour tests                           |
| **Playwright**            | End-to-end tests simulating real user flows         |

---

### Vitest

Vitest is a Vite-native test runner that's fast, Jest-compatible, and works naturally in a Next.js TypeScript project.

**Install:**

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom
```

**`vitest.config.ts`:**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  },
})
```

**`tests/setup.ts`:**

```ts
import '@testing-library/jest-dom'
```

**Add to `package.json`:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Example — testing a utility function:**

```ts
// lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatDuration } from './utils'

describe('formatDuration', () => {
  it('formats minutes under an hour correctly', () => {
    expect(formatDuration(45)).toBe('45 min')
  })

  it('formats durations over an hour correctly', () => {
    expect(formatDuration(90)).toBe('1 hr 30 min')
  })
})
```

---

### React Testing Library

React Testing Library (RTL) tests components from the user's perspective — it encourages you to query by what the user sees, not by implementation details like class names or component state.

**Install:**

```bash
pnpm add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

**Example — testing a task card:**

```tsx
// components/TaskCard.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './TaskCard'
import { mockTask } from '../tests/fixtures'

describe('TaskCard', () => {
  it('renders the task title', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText(mockTask.title)).toBeInTheDocument()
  })

  it('calls onComplete when the complete button is clicked', async () => {
    const onComplete = vi.fn()
    render(<TaskCard task={mockTask} onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('button', { name: /complete/i }))
    expect(onComplete).toHaveBeenCalledWith(mockTask.id)
  })
})
```

**Testing philosophy for Aura:**

- Test behaviour, not implementation — query by text, role, and label, not by CSS class or component internals
- Every interactive component should have at least a render test and an interaction test
- Don't test the AI output directly — mock the API response and test how the UI handles it

---

### Playwright (End-to-End)

Playwright tests the full application in a real browser — from typing into the input to seeing tasks appear on screen. These are slower than unit tests but give the highest confidence that the app works as a whole.

**Install:**

```bash
pnpm create playwright@latest
```

This scaffolds a `playwright.config.ts` and an `e2e/` directory.

**`playwright.config.ts`:**

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Example — testing the core input → task flow:**

```ts
// e2e/task-parsing.spec.ts
import { test, expect } from '@playwright/test'

test('parses free-form input into task cards', async ({ page }) => {
  await page.goto('/')

  await page
    .getByPlaceholder("What's on your mind?")
    .fill('I need to do laundry today and reply to Sarah urgently')
  await page.keyboard.press('Enter')

  await expect(page.getByText('Do laundry')).toBeVisible()
  await expect(page.getByText('Reply to Sarah')).toBeVisible()
})

test('completes a task and shows completion feedback', async ({ page }) => {
  await page.goto('/')
  // ... seed a task, click complete, assert animation/state
})
```

**Run e2e tests:**

```bash
# Run all e2e tests
pnpm exec playwright test

# Run with browser UI visible
pnpm exec playwright test --headed

# Open Playwright's interactive UI
pnpm exec playwright test --ui
```

> 💡 E2e tests that hit the real AI API will be slow and cost money. Use a mock server or environment flag to stub the `/api/parse-tasks` route during testing.

---

## Recommended `package.json` Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Suggested File Structure for Tests

```
aura/
├── tests/
│   ├── setup.ts               # Global test setup (RTL, jest-dom)
│   └── fixtures/
│       └── index.ts           # Shared mock data (mockTask, mockUser, etc.)
├── e2e/
│   ├── task-parsing.spec.ts
│   └── focus-mode.spec.ts
├── components/
│   ├── TaskCard.tsx
│   └── TaskCard.test.tsx      # Co-located component tests
├── lib/
│   ├── utils.ts
│   └── utils.test.ts          # Co-located unit tests
```

Co-locating unit and component tests next to the files they test makes them easier to find and harder to neglect.

---

_When in doubt, write the test that would have caught the bug you just fixed._ 🐛
