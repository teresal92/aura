import * as React from 'react'
import { cn } from '@/lib/utils'

export function InputGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-input bg-background px-3 shadow-aura-xs',
        className
      )}
      {...props}
    />
  )
}
