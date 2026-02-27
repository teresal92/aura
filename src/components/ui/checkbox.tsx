import * as React from 'react'
import { cn } from '@/lib/utils'

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            'h-4 w-4 rounded-sm border border-border bg-background text-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            className
          )}
          {...props}
        />
      </label>
    )
  }
)
Checkbox.displayName = 'Checkbox'
