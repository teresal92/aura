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
    'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10',
  success:
    'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-aura-success hover:bg-aura-success/10',
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return <button className={cn(variantClasses[variant], 'aura-focus-ring', className)} {...props} />
}
