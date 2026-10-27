'use client'

import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { useCreateTasks } from '@/lib/query/tasks'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/tasks'
import type { NewTask } from '@/types/task'

const HERO_PLACEHOLDER = 'Brain dump any fragments, errands, worries, names, half-formed plans...'

const MIN_TEXTAREA_HEIGHT = 216
const MAX_TEXTAREA_HEIGHT = 360

// Parsed tasks whose save failed, kept so "Try again" saves them without parsing again. Tagged
// with the user, so they're never saved into an account that signed in afterwards.
interface UnsavedTasks {
  userId: string
  tasks: NewTask[]
}

export function TaskInput({ onFocusChange }: { onFocusChange?: (isFocused: boolean) => void }) {
  const [input, setInput] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [unsaved, setUnsaved] = useState<UnsavedTasks | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isInputLoading = useTaskStore((state) => state.isInputLoading)
  const setInputLoading = useTaskStore((state) => state.setInputLoading)
  const createTasks = useCreateTasks()
  const { isLoaded, isSignedIn, userId } = useAuth()
  const clerk = useClerk()
  const unsavedTasks = unsaved && unsaved.userId === userId ? unsaved.tasks : null

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
    setInputError(null)
    setUnsaved(null)

    let parsedTasks: NewTask[]
    try {
      const response = await fetch('/api/parse-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: trimmed,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      if (!response.ok) {
        throw new Error(`Parse request failed: ${response.status}`)
      }

      const data = (await response.json()) as { tasks?: unknown }
      if (!Array.isArray(data.tasks)) {
        throw new Error('Invalid response payload')
      }

      parsedTasks = data.tasks as NewTask[]
    } catch {
      setInputError("Couldn't organize that. Try again.")
      setInputLoading(false)
      return
    }

    // Nothing to save; keep the text so the user can reword it.
    if (parsedTasks.length === 0) {
      setInputError("Couldn't find any tasks in that. Try rewording it.")
      setInputLoading(false)
      return
    }

    await saveTasks(parsedTasks)
  }

  // The input stays in the box until its tasks are saved.
  async function saveTasks(tasks: NewTask[]) {
    if (!userId) return
    setInputLoading(true)

    try {
      await createTasks.mutateAsync(tasks)
    } catch {
      setUnsaved({ userId, tasks })
      return
    } finally {
      setInputLoading(false)
    }

    setUnsaved(null)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = `${MIN_TEXTAREA_HEIGHT}px`
      textareaRef.current.style.overflowY = 'hidden'
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

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isInputLoading}
                className="aura-btn-primary shrink-0"
                aria-label="Organize tasks"
              >
                {isInputLoading ? 'organizing' : 'organize'}
              </button>

              {inputError ? (
                <p role="alert" className="text-base text-destructive">
                  {inputError}
                </p>
              ) : null}

              {unsavedTasks ? (
                <div role="alert" className="flex items-center gap-4">
                  <p className="text-base text-destructive">Couldn&apos;t save your tasks.</p>
                  <button
                    type="button"
                    onClick={() => saveTasks(unsavedTasks)}
                    disabled={isInputLoading}
                  >
                    Try again
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
