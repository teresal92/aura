import * as React from 'react'
import { cn } from '@/lib/utils'

export function Dropdown({
  trigger,
  children,
  className,
}: {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className={cn('relative inline-block text-left', className)}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open ? (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-popover p-2 shadow-aura-md">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export function DropdownItem({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'flex w-full items-center rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-secondary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
