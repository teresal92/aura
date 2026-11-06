import type { ReactNode } from 'react'

// Stands in for @clerk/nextjs in Storybook (aliased in .storybook/main.ts), so stories render
// signed-in and signed-out UI without a Clerk instance. Set per story with `parameters.auth`.

interface MockAuth {
  isLoaded: boolean
  isSignedIn: boolean
  userId: string | null
}

export const SIGNED_OUT: MockAuth = { isLoaded: true, isSignedIn: false, userId: null }
export const SIGNED_IN: MockAuth = { isLoaded: true, isSignedIn: true, userId: 'user_storybook' }

let auth: MockAuth = SIGNED_OUT

export function setMockAuth(next: MockAuth) {
  auth = next
}

export function useAuth() {
  return auth
}

export function useClerk() {
  return { openSignIn: () => {}, openSignUp: () => {} }
}

export function ClerkProvider({ children }: { children: ReactNode }) {
  return children
}

export function SignedIn({ children }: { children: ReactNode }) {
  return auth.isSignedIn ? children : null
}

export function SignedOut({ children }: { children: ReactNode }) {
  return auth.isSignedIn ? null : children
}

export function SignInButton({ children }: { children: ReactNode }) {
  return children
}

export function SignUpButton({ children }: { children: ReactNode }) {
  return children
}

// Approximates Clerk's avatar button: a 28px circle.
export function UserButton() {
  return <span aria-label="Account" className="block size-7 rounded-full bg-muted-foreground/40" />
}
