'use client'

import { useEffect, useState } from 'react'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Overlay } from '@/components/Overlay'
import { TaskInput } from '@/components/TaskInput'
import { TaskList } from '@/components/TaskList'
import { TypewriterText } from '@/components/TypewriterText'
import { PREVIEW_TASKS } from '@/lib/preview-tasks'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/tasks'

// Temporary: set to true to preview the task list with placeholder data (no sign-in needed).
const SHOW_PREVIEW_TASKS = false

export default function Home() {
  const [isWritingFocused, setIsWritingFocused] = useState(false)
  const { tasks, isInputLoading } = useTaskStore()

  useEffect(() => {
    if (!SHOW_PREVIEW_TASKS) return
    const store = useTaskStore.getState()
    if (store.tasks.length > 0) return

    store.addTasks(PREVIEW_TASKS)
    const lastTask = useTaskStore.getState().tasks.at(-1)
    if (lastTask) store.completeTask(lastTask.id)
  }, [])

  const taskList = (
    <div
      className={cn(
        'mt-16 transition-opacity duration-250',
        isWritingFocused ? 'opacity-50' : 'opacity-100'
      )}
    >
      <TaskList />
    </div>
  )
  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8">
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
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'size-8 ring-1 ring-border',
                      },
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto my-auto flex w-full max-w-3xl flex-col py-12 sm:py-16">
          <div
            className={cn(
              'mb-12 transition-all duration-250',
              isWritingFocused ? 'translate-y-1 opacity-50' : 'opacity-100'
            )}
          >
            {tasks.length === 0 ? (
              <h1>
                Just start <TypewriterText text="typing." className="italic" />
              </h1>
            ) : (
              <h1>Keep going.</h1>
            )}
          </div>

          <TaskInput onFocusChange={setIsWritingFocused} />

          {SHOW_PREVIEW_TASKS ? taskList : <SignedIn>{taskList}</SignedIn>}
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
    </main>
  )
}
