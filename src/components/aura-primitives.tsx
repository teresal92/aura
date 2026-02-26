'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export function AuraLogo({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeMap = {
    sm: { wrapper: 'h-7 w-7', icon: 'h-3.5 w-3.5', text: 'text-sm' },
    md: { wrapper: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-lg' },
    lg: { wrapper: 'h-10 w-10', icon: 'h-5 w-5', text: 'text-xl' },
  }
  const s = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('flex items-center justify-center rounded-xl bg-primary/10', s.wrapper)}>
        <svg
          className={cn('text-primary', s.icon)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9" />
          <path d="M12 3c2.5 2.5 4 6 4 9" />
          <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <span className={cn('font-semibold tracking-tight text-foreground', s.text)}>aura</span>
    </div>
  )
}

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
      subtle: 'aura-icon-btn hover:bg-primary/10 hover:text-primary',
      danger: 'aura-icon-btn hover:bg-destructive/10 hover:text-destructive',
      success: 'aura-icon-btn hover:bg-aura-success/15 hover:text-aura-success',
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
    bg: 'bg-aura-urgent/10',
    text: 'text-aura-urgent',
    dot: 'bg-aura-urgent',
  },
  high: {
    label: 'High',
    bg: 'bg-aura-high/10',
    text: 'text-aura-high',
    dot: 'bg-aura-high',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-aura-medium/10',
    text: 'text-aura-medium',
    dot: 'bg-aura-medium',
  },
  low: {
    label: 'Low',
    bg: 'bg-aura-low/10',
    text: 'text-aura-low',
    dot: 'bg-aura-low',
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
    <span className={cn('aura-badge bg-secondary text-secondary-foreground', className)}>
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
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 aura-focus-ring',
        'transition-all duration-200',
        checked
          ? 'border-aura-success bg-aura-success text-card'
          : 'border-border hover:border-primary/50 hover:bg-primary/5',
        className
      )}
      aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
      role="checkbox"
      aria-checked={checked}
    >
      {checked ? <span className="text-[10px] font-bold">✓</span> : null}
    </button>
  )
}
