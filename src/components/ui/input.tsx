import * as React from 'react'
import { cn } from '@/lib/utils'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-aura-xs',
          'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-primary/40',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
