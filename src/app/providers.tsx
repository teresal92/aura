'use client'

import { useEffect } from 'react'
import getQueryClient from '@/lib/query/query-client'
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { clerkAppearance } from '@/lib/clerk-appearance'

// Drops every cached query once signed out, so the next account on this browser never sees the
// previous one's tasks.
export function ClearQueryCacheOnSignOut() {
  const { isLoaded, isSignedIn } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isLoaded && !isSignedIn) queryClient.clear()
  }, [isLoaded, isSignedIn, queryClient])

  return null
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <ClerkProvider appearance={clerkAppearance}>
      <QueryClientProvider client={queryClient}>
        <ClearQueryCacheOnSignOut />
        {children}
      </QueryClientProvider>
    </ClerkProvider>
  )
}
