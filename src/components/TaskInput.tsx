'use client'

import { useEffect, useRef, useState } from 'react'
import { useTaskStore } from '@/store/tasks'
import { cn } from '@/lib/utils'

const PLACEHOLDER_EXAMPLES = [
  "ok so i really need to do laundry today, also i have that dentist thing this week and i keep forgetting to reply to sarah's email which is actually kind of urgent...",
  "buy groceries, call the bank about that weird charge, finish the slides for monday's presentation...",
  'i should probably exercise, also i need to renew my passport and the deadline is coming up fast...',
  'clean the apartment before mom visits saturday, book a vet appointment for the cat, and oh yeah taxes...',
]

export function TaskInput() {
  const [input, setInput] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { addTasks, isInputLoading, setInputLoading } = useTaskStore()

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((index) => (index + 1) % PLACEHOLDER_EXAMPLES.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }, [input])

  async function handleSubmit() {
    const trimmed = input.trim()
    if (!trimmed || isInputLoading) return

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
      if (Array.isArray(data.tasks)) {
        addTasks(data.tasks as Parameters<typeof addTasks>[0])
        setInput('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
      } else {
        throw new Error('Invalid response payload')
      }
    } catch (error) {
      console.error(error)
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

  return (
    <div className="w-full">
      <div
        className={cn(
          'aura-card relative overflow-hidden',
          'focus-within:border-primary/40',
          isInputLoading && 'opacity-80'
        )}
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-1">
          <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            Brain dump
          </span>
        </div>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
          disabled={isInputLoading}
          rows={3}
          className={cn(
            'w-full resize-none bg-transparent px-4 py-3 text-base leading-relaxed',
            'placeholder:text-muted-foreground/40 placeholder:leading-relaxed',
            'focus:outline-none disabled:cursor-not-allowed',
            'text-foreground'
          )}
          aria-label="Type your thoughts, tasks, or brain dump here"
        />

        <div className="flex items-center justify-between px-4 pb-3">
          <p className="text-xs text-muted-foreground/50">
            Press Enter to organize · Shift+Enter for new line
          </p>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isInputLoading}
            className="aura-btn-primary"
            aria-label="Organize tasks"
          >
            {isInputLoading ? 'Organizing...' : 'Organize'}
          </button>
        </div>
      </div>
    </div>
  )
}
