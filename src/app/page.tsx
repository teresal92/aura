'use client'

import { useState } from 'react'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { AuraLogo } from '@/components/aura-primitives'
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
    <main
      className={cn(
        'relative min-h-screen bg-background transition-colors duration-300',
        isWritingFocused && 'bg-aura-depth'
      )}
    >
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 pb-16 pt-6 sm:px-8 lg:px-12">
        <header
          className={cn(
            'border-b border-aura-divider/90 pb-5 transition-opacity duration-300',
            isWritingFocused ? 'opacity-65' : 'opacity-95'
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <AuraLogo />

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
                    <button className="aura-btn-shell-secondary" type="button">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="aura-btn-shell-primary" type="button">
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

        <div className="mx-auto my-auto flex w-full max-w-3xl flex-col py-10 sm:py-12">
          <div
            className={cn(
              'mb-8 text-center transition-all duration-300',
              isWritingFocused ? 'translate-y-1 opacity-45' : 'opacity-80'
            )}
          >
            {tasks.length === 0 ? (
              <>
                <h1 className="text-[2rem] leading-tight font-bold text-aura-foreground-strong sm:text-[2.5rem] text-balance">
                  What&apos;s swirling around in your head?
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground text-balance">
                  Just type it all out below. Messy and half-formed is fine. Aura will turn it into
                  a plan.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-[1.7rem] leading-tight font-bold text-aura-foreground-strong sm:text-[2.5rem] text-balance">
                  Keep laying it out.
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground text-balance">
                  Add what is still circling. The page can hold it before the list does.
                </p>
              </>
            )}
          </div>

          <div className="mb-6 h-px w-full bg-aura-divider/90" />

          <TaskInput isWritingFocused={isWritingFocused} onFocusChange={setIsWritingFocused} />

          <SignedIn>
            <div
              className={cn(
                'mt-10 transition-all duration-300',
                isWritingFocused ? 'opacity-55' : 'opacity-100'
              )}
            >
              <div className="mb-6 h-px w-full bg-aura-divider/90" />
              <TaskList />
            </div>
          </SignedIn>
        </div>
      </div>

      <Overlay
        isActive={isInputLoading}
        contentClassName={cn(
          'aura-card flex min-w-72 items-center gap-4 rounded-3xl px-5 py-4',
          'border-aura-divider/80 bg-card/92 aura-shadow-lg'
        )}
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-aura-divider border-t-primary" />
        <div role="status" aria-live="polite" aria-busy={isInputLoading}>
          <p className="text-sm font-semibold text-aura-foreground-strong">
            Organizing your thoughts
          </p>
          <p className="text-sm text-muted-foreground">
            Turning your brain dump into a clearer plan.
          </p>
        </div>
      </Overlay>
    </main>
  )
}
