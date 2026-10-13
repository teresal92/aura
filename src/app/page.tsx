'use client'

import { useState } from 'react'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Overlay } from '@/components/Overlay'
import { TaskInput } from '@/components/TaskInput'
import { TaskList } from '@/components/TaskList'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/tasks'

export default function Home() {
  const [isWritingFocused, setIsWritingFocused] = useState(false)
  const { tasks, isInputLoading } = useTaskStore()
  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <main className="relative min-h-screen overflow-hidden bg-background transition-colors duration-300">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 pb-20 pt-6 sm:px-8 sm:pb-24 lg:px-12">
        <header
          className={cn(
            'border-b border-border/75 pb-5 transition-all duration-300',
            isWritingFocused ? 'opacity-55' : 'opacity-90'
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-display text-3xl">aura</h1>
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
                        avatarBox: 'h-8 w-8 ring-1 ring-border',
                      },
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto my-auto flex w-full max-w-184 flex-col py-12 sm:py-16">
          <div
            className={cn(
              'mb-10 px-4 transition-all duration-300 sm:mb-12 sm:px-6',
              isWritingFocused ? 'translate-y-1 opacity-38' : 'opacity-88'
            )}
          >
            {tasks.length === 0 ? (
              <>
                <h1 className="max-w-136 text-4xl leading-[1.04] font-normal text-foreground text-balance">
                  Just start typing.
                </h1>
              </>
            ) : (
              <>
                <h1 className="max-w-120 text-[2.05rem] leading-[1.04] font-normal text-foreground text-balance sm:text-[2.8rem]">
                  Keep going.
                </h1>
                <p className="mt-4 max-w-104 text-base leading-relaxed text-muted-foreground text-balance">
                  Add anything still circling.
                </p>
              </>
            )}
          </div>

          <TaskInput onFocusChange={setIsWritingFocused} />

          <SignedIn>
            <div
              className={cn(
                'mt-14 px-4 transition-all duration-300 sm:px-6',
                isWritingFocused ? 'opacity-50' : 'opacity-100'
              )}
            >
              <TaskList />
            </div>
          </SignedIn>
        </div>
      </div>

      <Overlay
        isActive={isInputLoading}
        contentClassName={cn(
          'aura-card flex min-w-72 items-center gap-4 rounded-3xl px-5 py-4',
          'border-border/80 bg-card/92 aura-shadow-lg'
        )}
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
        <div role="status" aria-live="polite" aria-busy={isInputLoading}>
          <p className="text-sm font-semibold text-foreground">Organizing your thoughts</p>
          <p className="text-sm text-muted-foreground">
            Turning your brain dump into a clearer plan.
          </p>
        </div>
      </Overlay>
    </main>
  )
}
