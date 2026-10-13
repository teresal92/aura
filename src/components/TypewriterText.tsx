'use client'

import { useEffect, useState } from 'react'

const START_DELAY_MS = 450
const TYPE_INTERVAL_MS = 120

export function TypewriterText({ text, className }: { text: string; className?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count >= text.length) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const delay = reduceMotion ? 0 : count === 0 ? START_DELAY_MS : TYPE_INTERVAL_MS
    const timeout = window.setTimeout(() => setCount((current) => current + 1), delay)

    return () => window.clearTimeout(timeout)
  }, [count, text.length])

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, count)}
        <span className="aura-caret ml-0.5 inline-block h-[0.8em] w-0.5 bg-foreground align-baseline" />
        <span className="invisible">{text.slice(count)}</span>
      </span>
    </span>
  )
}
