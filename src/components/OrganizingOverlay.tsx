'use client'

import { cn } from '@/lib/utils'

export function OrganizingOverlay({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-30 flex items-center justify-center backdrop-blur-md',
        'transition-opacity duration-200',
        isActive
          ? 'bg-background/55 opacity-100 pointer-events-auto cursor-wait'
          : 'opacity-0 pointer-events-none'
      )}
      aria-hidden={!isActive}
    >
      <div
        className={cn(
          'aura-card flex min-w-72 items-center gap-4 rounded-3xl px-5 py-4',
          'border-aura-divider/80 bg-card/92 aura-shadow-lg',
          'transition-transform duration-200',
          isActive ? 'translate-y-0 scale-100' : 'translate-y-1 scale-[0.985]'
        )}
        role={isActive ? 'status' : undefined}
        aria-live={isActive ? 'polite' : undefined}
        aria-busy={isActive || undefined}
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-aura-divider border-t-primary" />
        <div>
          <p className="text-sm font-semibold text-aura-foreground-strong">
            Organizing your thoughts
          </p>
          <p className="text-sm text-muted-foreground">
            Turning your brain dump into a clearer plan.
          </p>
        </div>
      </div>
    </div>
  )
}
