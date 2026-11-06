import { useState } from 'react'
import type { Decorator, Preview } from '@storybook/nextjs-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fontVariables } from '../src/app/fonts'
import '../src/app/globals.css'
import { useTaskStore } from '../src/store/tasks'
import { installApiMock, type ApiRoutes } from '../src/stories/mock-api'
import { SIGNED_IN, SIGNED_OUT, setMockAuth } from './mocks/clerk'

/**
 * Story parameters this preview understands:
 * - `auth`: `'signed-in'` or `'signed-out'` (default).
 * - `api`: fetch stubs for `/api/*` routes; see `src/stories/mock-api.ts`.
 * - `inputLoading`: starts the store's `isInputLoading` flag (the "organizing" overlay).
 */
interface AppParameters {
  auth?: 'signed-in' | 'signed-out'
  api?: ApiRoutes
  inputLoading?: boolean
}

// A fresh client per story, so cached tasks never leak between stories. No retries, so error
// states show at once.
function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: Infinity, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
      })
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

// Same `<html>` and `<body>` setup as src/app/layout.tsx, plus the theme toolbar.
const withApp: Decorator = (Story, { globals }) => {
  document.documentElement.classList.toggle('dark', globals.theme === 'dark')
  document.body.classList.add(...fontVariables.split(' '), 'antialiased')
  return (
    <QueryProvider>
      <Story />
    </QueryProvider>
  )
}

const preview: Preview = {
  decorators: [withApp],

  beforeEach: ({ parameters: storyParameters }) => {
    const parameters = storyParameters as AppParameters
    setMockAuth(parameters.auth === 'signed-in' ? SIGNED_IN : SIGNED_OUT)
    useTaskStore.setState({ isInputLoading: parameters.inputLoading ?? false, focusTaskId: null })
    return installApiMock(parameters.api ?? {})
  },

  globalTypes: {
    theme: {
      description: 'Color theme. The app never applies dark yet; this previews its tokens.',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark (unused in the app)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: { order: ['Foundations', 'Current UI', ['Primitives', 'Components', 'Pages']] },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
}

export default preview
