'use client'

import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/tasks'

const HERO_PLACEHOLDER = 'fragments, errands, worries, names, half-formed plans...'

const MIN_TEXTAREA_HEIGHT = 216
const MAX_TEXTAREA_HEIGHT = 360

export function TaskInput({ onFocusChange }: { onFocusChange?: (isFocused: boolean) => void }) {
  const [input, setInput] = useState('')
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

  function reportFocusChange(nextState: boolean) {
    onFocusChange?.(nextState)
  }

  async function handleSubmit(forcedInput?: string) {
    const trimmed = (forcedInput ?? input).trim()
    if (!trimmed || isInputLoading) return
    if (!isLoaded) return

    reportFocusChange(false)
    textareaRef.current?.blur()

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

    reportFocusChange(false)
  }

  return (
    <div className="w-full">
      <div
        className="w-full"
        onFocusCapture={() => reportFocusChange(true)}
        onBlurCapture={handleBlur}
      >
        <div
          className={cn(
            'relative overflow-hidden py-3 sm:py-4',
            'transition-all duration-300 ease-out',
            isInputLoading && 'opacity-85',
            'opacity-95'
          )}
        >
          <div className="relative">
            <div className="px-4 sm:px-6">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={HERO_PLACEHOLDER}
                disabled={isInputLoading}
                rows={6}
                className={cn(
                  'aura-text-typewriter min-h-[216px] w-full resize-none bg-transparent pr-1 font-normal',
                  'text-aura-foreground-strong placeholder:text-muted-foreground/76',
                  'focus:outline-none disabled:cursor-not-allowed disabled:text-muted-foreground'
                )}
                style={{ height: `${MIN_TEXTAREA_HEIGHT}px` }}
                aria-label="Type your thoughts, tasks, or brain dump here"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-4 px-4 pt-3 sm:mt-5 sm:px-6">
              <p className="text-xs italic leading-relaxed text-muted-foreground/78">
                Enter sends. Shift+Enter adds a line.
              </p>

              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isInputLoading}
                className={cn('aura-btn-editorial shrink-0')}
                aria-label="Organize tasks"
              >
                {isInputLoading ? 'organizing' : 'organize'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
