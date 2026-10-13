import type { ClerkProvider } from '@clerk/nextjs'

type ClerkAppearance = NonNullable<React.ComponentProps<typeof ClerkProvider>['appearance']>

// Maps Clerk's components onto the Aura tokens in globals.css.
// Clerk styles live in the `clerk` CSS layer (declared at the top of globals.css),
// so they override Aura's base styles while Tailwind classes below still win.
export const clerkAppearance: ClerkAppearance = {
  theme: 'simple',
  cssLayerName: 'clerk',
  variables: {
    colorBackground: 'var(--background)',
    colorForeground: 'var(--foreground)',
    colorMutedForeground: 'var(--muted-foreground)',
    colorPrimary: 'var(--primary)',
    colorPrimaryForeground: 'var(--primary-foreground)',
    colorInput: 'var(--background)',
    colorInputForeground: 'var(--foreground)',
    colorBorder: 'var(--border)',
    colorRing: 'var(--foreground)',
    colorDanger: 'var(--destructive)',
    borderRadius: '0',
    fontFamily: 'var(--font-geist-sans), sans-serif',
    fontSize: '1rem',
  },
  elements: {
    cardBox: 'border border-border shadow-none',
    card: 'bg-background shadow-none',
    headerTitle: 'font-heading text-2xl font-semibold',
    headerSubtitle: 'text-muted-foreground',
    formButtonPrimary: 'aura-btn-primary border border-foreground shadow-none',
    // Clerk defines its own `--border` on buttons, so `border-border` would not resolve to Aura's
    // token here. Match the outlined "Sign in" button instead.
    socialButtonsBlockButton:
      'border border-foreground shadow-none hover:bg-foreground hover:text-background',
    formFieldInput: 'border border-border bg-transparent shadow-none focus:border-foreground',
    footerActionLink: 'text-foreground underline',
    avatarBox: 'size-8 ring-1 ring-border',
  },
}
