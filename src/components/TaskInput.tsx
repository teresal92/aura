'use client'

import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/tasks'

const HERO_PLACEHOLDER = 'Brain dump any fragments, errands, worries, names, half-formed plans...'

const MIN_TEXTAREA_HEIGHT = 216
const MAX_TEXTAREA_HEIGHT = 360

export function TaskInput({ onFocusChange }: { onFocusChange?: (isFocused: boolean) => void }) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { addTasks, isInputLoading, setInputLoading, startReview } = useTaskStore()
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
      startReview()
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
            'relative overflow-hidden',
            'transition-opacity duration-250 ease-out',
            isInputLoading && 'opacity-50'
          )}
        >
          <div className="relative">
            <div className="border border-border p-4 transition-colors duration-150 focus-within:border-foreground sm:p-6">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={HERO_PLACEHOLDER}
                disabled={isInputLoading}
                rows={6}
                className={cn(
                  'aura-text-typewriter min-h-54 w-full resize-none bg-transparent font-normal',
                  'text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none disabled:cursor-not-allowed disabled:text-muted-foreground'
                )}
                style={{ height: `${MIN_TEXTAREA_HEIGHT}px` }}
                aria-label="Type your thoughts, tasks, or brain dump here"
              />
            </div>

            <div className="mt-6">
              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isInputLoading}
                className="aura-btn-primary shrink-0"
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
