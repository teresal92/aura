import type { Metadata } from 'next'

import { Cormorant_Garamond, Geist_Mono, Lora } from 'next/font/google'
import './globals.css'
import AppProviders from './providers'

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant-garamond',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

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
        <body
          className={`${cormorantGaramond.variable} ${lora.variable} ${geistMono.variable} min-h-screen antialiased`}
        >
          {children}
        </body>
      </html>
    </AppProviders>
  )
}
