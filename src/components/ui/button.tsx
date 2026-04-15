import * as React from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'subtle' | 'ghost' | 'danger' | 'success'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'aura-btn-primary',
  subtle: 'aura-btn-subtle',
  ghost: 'aura-btn-subtle bg-transparent hover:bg-secondary',
  danger:
    'inline-flex items-center justify-center rounded-full px-1 py-1 text-sm font-medium text-destructive underline decoration-transparent underline-offset-[0.2em] transition-[color,text-decoration-color,opacity] hover:text-[#684239] hover:decoration-current',
  success:
    'inline-flex items-center justify-center rounded-full px-1 py-1 text-sm font-medium text-aura-success underline decoration-transparent underline-offset-[0.2em] transition-[color,text-decoration-color,opacity] hover:text-aura-foreground-strong hover:decoration-current',
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return <button className={cn(variantClasses[variant], 'aura-focus-ring', className)} {...props} />
}
