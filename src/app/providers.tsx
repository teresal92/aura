'use client'

import getQueryClient from '@/lib/query/query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/nextjs'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ClerkProvider>
  )
}
