'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'subtle' | 'danger' | 'success'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', variant = 'ghost', className, children, ...props }, ref) => {
    const sizeMap = {
      sm: 'h-8 w-8',
      md: 'h-9 w-9',
      lg: 'h-10 w-10',
    }
    const variantMap = {
      ghost: 'aura-icon-btn',
      subtle: 'aura-icon-btn hover:bg-secondary/70 hover:text-foreground',
      danger: 'aura-icon-btn hover:bg-destructive/10 hover:text-destructive',
      success: 'aura-icon-btn hover:bg-foreground/10 hover:text-foreground',
    }

    return (
      <button
        ref={ref}
        className={cn(variantMap[variant], sizeMap[size], 'aura-focus-ring', className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
IconButton.displayName = 'IconButton'

const PRIORITY_CONFIG = {
  urgent: {
    label: 'Urgent',
    bg: 'bg-muted',
    text: 'text-foreground',
    dot: 'bg-foreground',
  },
  high: {
    label: 'High',
    bg: 'bg-muted',
    text: 'text-foreground',
    dot: 'bg-muted-foreground',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
  low: {
    label: 'Low',
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
} as const

export type Priority = keyof typeof PRIORITY_CONFIG

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span className={cn('aura-badge', config.bg, config.text, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

export function PriorityDot({ priority, className }: { priority: Priority; className?: string }) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span
      className={cn('inline-block h-2 w-2 rounded-full', config.dot, className)}
      aria-label={`${config.label} priority`}
    />
  )
}

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  return (
    <span className={cn('aura-badge bg-secondary/70 text-muted-foreground', className)}>
      {category}
    </span>
  )
}

export function MetaText({
  icon,
  children,
  className,
}: {
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs text-muted-foreground', className)}>
      {icon}
      {children}
    </span>
  )
}

export function CompletionCheckbox({
  checked,
  onChange,
  className,
}: {
  checked: boolean
  onChange: () => void
  className?: string
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'aura-focus-ring flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
        'transition-all duration-200',
        checked
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-background/50 hover:border-muted-foreground hover:bg-secondary/60',
        className
      )}
      aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
      role="checkbox"
      aria-checked={checked}
    >
      {checked ? <span className="aura-text-micro font-bold">✓</span> : null}
    </button>
  )
}

export function SectionHeader({
  children,
  count,
  className,
}: {
  children: React.ReactNode
  count?: number
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <h2 className="aura-text-label-wide font-medium uppercase text-muted-foreground">
        {children}
        {count !== undefined ? <span className="ml-1.5 tabular-nums">{count}</span> : null}
      </h2>
      <span className="h-px flex-1 bg-border/80" aria-hidden="true" />
    </div>
  )
}
