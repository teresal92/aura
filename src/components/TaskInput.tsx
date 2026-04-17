'use client'

import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/tasks'

const HERO_PLACEHOLDER =
  "what's been on your mind lately...\n\nerrands, plans, things left unfinished..."

const MIN_TEXTAREA_HEIGHT = 180
const MAX_TEXTAREA_HEIGHT = 220

export function TaskInput({
  isWritingFocused = false,
  onFocusChange,
}: {
  isWritingFocused?: boolean
  onFocusChange?: (isFocused: boolean) => void
}) {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { addTasks, isInputLoading, setInputLoading } = useTaskStore()
  const { isLoaded, isSignedIn } = useAuth()
  const clerk = useClerk()

  const pendingInputKey = 'aura:pending-input'
  const pendingSubmitKey = 'aura:pending-submit'
  const submitPendingInput = useEffectEvent((pendingInput: string) => {
    void handleSubmit(pendingInput)
  })

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    syncTextareaHeight()
  }, [input])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    if (typeof window === 'undefined') return

    const shouldSubmit = window.sessionStorage.getItem(pendingSubmitKey) === '1'
    const pendingInput = shouldSubmit ? window.sessionStorage.getItem(pendingInputKey) : null
    if (!pendingInput) return

    window.sessionStorage.removeItem(pendingSubmitKey)
    window.sessionStorage.removeItem(pendingInputKey)
    setInput(pendingInput)
    submitPendingInput(pendingInput)
  }, [isLoaded, isSignedIn])

  function syncTextareaHeight() {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
    textarea.style.overflowY = textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden'
  }

  function updateFocusState(nextState: boolean) {
    setIsFocused(nextState)
    onFocusChange?.(nextState)
  }

  async function handleSubmit(forcedInput?: string) {
    const trimmed = (forcedInput ?? input).trim()
    if (!trimmed || isInputLoading) return
    if (!isLoaded) return

    if (!isSignedIn) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(pendingInputKey, trimmed)
        window.sessionStorage.setItem(pendingSubmitKey, '1')
      }
      clerk.openSignIn({})
      return
    }

    setInputLoading(true)

    try {
      const response = await fetch('/api/parse-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmed }),
      })

      if (!response.ok) {
        throw new Error(`Parse request failed: ${response.status}`)
      }

      const data = (await response.json()) as { tasks?: unknown }
      if (!Array.isArray(data.tasks)) {
        throw new Error('Invalid response payload')
      }

      addTasks(data.tasks as Parameters<typeof addTasks>[0])
      setInput('')

      if (textareaRef.current) {
        textareaRef.current.style.height = `${MIN_TEXTAREA_HEIGHT}px`
        textareaRef.current.style.overflowY = 'hidden'
        textareaRef.current.focus()
      }
    } catch {
    } finally {
      setInputLoading(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return
    }

    updateFocusState(false)
  }

  return (
    <div className="w-full">
      <div
        className="mx-auto max-w-176"
        onFocusCapture={() => updateFocusState(true)}
        onBlurCapture={handleBlur}
      >
        <div
          className={cn(
            'aura-card relative overflow-hidden rounded-4xl px-6 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-7',
            'transition-all duration-300',
            isInputLoading && 'opacity-85',
            isFocused ? 'aura-writing-surface-active' : 'border-border bg-card aura-shadow-sm',
            isWritingFocused && !isFocused && 'opacity-95'
          )}
        >
          <div className="aura-paper-overlay pointer-events-none absolute inset-0" />

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={HERO_PLACEHOLDER}
              disabled={isInputLoading}
              rows={6}
              className={cn(
                'min-h-[180px] w-full resize-none bg-transparent text-[1.18rem] leading-[1.72] tracking-[0.004em] font-normal',
                'text-aura-foreground-strong placeholder:text-muted-foreground/78',
                'focus:outline-none disabled:cursor-not-allowed disabled:text-muted-foreground'
              )}
              style={{ height: `${MIN_TEXTAREA_HEIGHT}px` }}
              aria-label="Type your thoughts, tasks, or brain dump here"
            />

            <div className="mt-4 flex items-end justify-between gap-4">
              <p className="max-w-sm text-sm italic leading-relaxed text-muted-foreground/85">
                write it as it comes - structure can follow
              </p>

              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isInputLoading}
                className={cn('aura-btn-shell-primary shrink-0 px-4 py-2 tracking-[0.01em]')}
                aria-label="Organize tasks"
              >
                {isInputLoading ? 'organizing...' : 'organize ->'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
