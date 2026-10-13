'use client'

import { useState } from 'react'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { DevPreviewToggle } from '@/components/DevPreviewToggle'
import { Overlay } from '@/components/Overlay'
import { TaskInput } from '@/components/TaskInput'
import { TaskList } from '@/components/TaskList'
import { TypewriterText } from '@/components/TypewriterText'
import { usePreviewTasksEnabled } from '@/lib/preview-tasks'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/tasks'

export default function Home() {
  const [isWritingFocused, setIsWritingFocused] = useState(false)
  const { tasks, isInputLoading } = useTaskStore()
  const previewTasksEnabled = usePreviewTasksEnabled()

  const taskList = (
    <div
      className={cn(
        'mt-16 border-t border-border pt-12 transition-opacity duration-250',
        isWritingFocused ? 'opacity-50' : 'opacity-100'
      )}
    >
      <TaskList />
    </div>
  )
  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 sm:px-6 lg:px-8">
      {/* Single axis: header, headline, input and tasks all share one column edge. */}
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col pb-24 pt-8">
        <header
          className={cn(
            'border-b border-border pb-6 transition-opacity duration-250',
            isWritingFocused ? 'opacity-50' : 'opacity-100'
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="font-display text-3xl">aura</p>
            <div className="flex items-center gap-4">
              <SignedIn>
                {tasks.length > 0 ? (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground tabular-nums">
                    {activeTasks.length > 0 ? <span>{activeTasks.length} active</span> : null}
                    {completedTasks.length > 0 ? <span>{completedTasks.length} done</span> : null}
                  </div>
                ) : null}
              </SignedIn>

              <div className="flex items-center gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button type="button">Sign in</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button type="button" className="aura-btn-primary">
                      Sign up
                    </button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col pt-16 pb-12 sm:pt-24">
          <div
            className={cn(
              'mb-16 transition-all duration-250',
              isWritingFocused ? 'translate-y-1 opacity-50' : 'opacity-100'
            )}
          >
            {tasks.length === 0 ? (
              // pl-1: Cormorant's "J" hooks ~0.05em left of its box; nudge it onto the textarea edge.
              <h1 className="pl-1">
                Just start <TypewriterText text="typing." className="italic" />
              </h1>
            ) : (
              <h1>Keep going.</h1>
            )}
          </div>

          <TaskInput onFocusChange={setIsWritingFocused} />

          {previewTasksEnabled ? taskList : <SignedIn>{taskList}</SignedIn>}
        </div>
      </div>

      <Overlay
        isActive={isInputLoading}
        contentClassName="flex min-w-72 items-center gap-4 border border-border bg-background px-6 py-4 aura-shadow-lg"
      >
        <div className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
        <div role="status" aria-live="polite" aria-busy={isInputLoading}>
          <p className="text-base font-semibold text-foreground">Organizing your thoughts</p>
          <p className="text-base text-muted-foreground">
            Turning your brain dump into a clearer plan.
          </p>
        </div>
      </Overlay>

      <DevPreviewToggle />
    </main>
  )
}
