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
    'aura-btn-linklike font-medium text-destructive hover:text-aura-foreground-strong hover:decoration-current',
  success:
    'aura-btn-linklike font-medium text-aura-success hover:text-aura-foreground-strong hover:decoration-current',
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return <button className={cn(variantClasses[variant], 'aura-focus-ring', className)} {...props} />
}
