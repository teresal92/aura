import * as React from 'react'
import { cn } from '@/lib/utils'

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function DialogContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-aura-lg',
        className
      )}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4', className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold', className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex items-center justify-end gap-3', className)} {...props} />
}
