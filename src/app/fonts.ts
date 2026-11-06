import { Cormorant_Garamond, Fraunces, Geist, Geist_Mono } from 'next/font/google'

// Shared by the root layout and Storybook, so stories render with the app's real fonts.

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant-garamond',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['SOFT', 'WONK'],
})

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

/** Classes that define the `--font-*` variables globals.css reads. Apply them to `<body>`. */
export const fontVariables = [cormorantGaramond, fraunces, geist, geistMono]
  .map((font) => font.variable)
  .join(' ')
