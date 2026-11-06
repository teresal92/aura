import type { Metadata } from 'next'

import './globals.css'
import { fontVariables } from './fonts'
import AppProviders from './providers'

export const metadata: Metadata = {
  title: 'Aura',
  description: 'AI-powered todo app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AppProviders>
      <html lang="en" className="h-full">
        <body className={`${fontVariables} min-h-screen antialiased`}>{children}</body>
      </html>
    </AppProviders>
  )
}
