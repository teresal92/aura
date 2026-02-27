import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'aura-urgent': 'var(--aura-urgent)',
        'aura-high': 'var(--aura-high)',
        'aura-medium': 'var(--aura-medium)',
        'aura-low': 'var(--aura-low)',
        'aura-success': 'var(--aura-success)',
        'aura-surface-warm': 'var(--aura-surface-warm)',
        'aura-surface-elevated': 'var(--aura-surface-elevated)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        'aura-xs': 'var(--aura-shadow-xs)',
        'aura-sm': 'var(--aura-shadow-sm)',
        'aura-md': 'var(--aura-shadow-md)',
        'aura-lg': 'var(--aura-shadow-lg)',
        'aura-focus': 'var(--aura-shadow-focus)',
      },
      transitionTimingFunction: {
        'aura-out': 'var(--aura-ease-out)',
        'aura-spring': 'var(--aura-ease-spring)',
      },
      transitionDuration: {
        fast: 'var(--aura-duration-fast)',
        base: 'var(--aura-duration-base)',
        slow: 'var(--aura-duration-slow)',
        emphasis: 'var(--aura-duration-emphasis)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  darkMode: ['class'],
  plugins: [],
}

export default config
