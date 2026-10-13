import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Overlay({
  isActive,
  children,
  className,
  contentClassName,
}: {
  isActive: boolean
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-30 flex items-center justify-center p-4 backdrop-blur-md',
        'transition-opacity duration-250',
        isActive
          ? 'bg-background/50 opacity-100 pointer-events-auto cursor-wait'
          : 'opacity-0 pointer-events-none',
        className
      )}
      aria-hidden={!isActive}
    >
      <div
        className={cn(
          'transition-transform duration-250',
          isActive ? 'translate-y-0 scale-100' : 'translate-y-1 scale-98',
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}
