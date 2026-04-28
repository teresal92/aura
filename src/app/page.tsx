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
        'relative min-h-screen overflow-hidden bg-background transition-colors duration-300',
        isWritingFocused && 'bg-aura-depth/70'
      )}
    >
      <div className="aura-page-grain pointer-events-none absolute inset-0" />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 pb-20 pt-6 sm:px-8 sm:pb-24 lg:px-12">
        <header
          className={cn(
            'border-b border-aura-divider/75 pb-5 transition-all duration-300',
            isWritingFocused ? 'opacity-55' : 'opacity-90'
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

        <div className="mx-auto my-auto flex w-full max-w-[46rem] flex-col py-12 sm:py-16">
          <div
            className={cn(
              'mb-10 px-4 transition-all duration-300 sm:mb-12 sm:px-6',
              isWritingFocused ? 'translate-y-1 opacity-38' : 'opacity-88'
            )}
          >
            {tasks.length === 0 ? (
              <>
                <h1 className="max-w-[34rem] text-[2.15rem] leading-[1.04] font-normal text-aura-foreground-strong text-balance sm:text-[2.95rem]">
                  Begin anywhere.
                </h1>
                <p className="mt-4 max-w-[28rem] text-base leading-relaxed text-muted-foreground text-balance">
                  Rough sentences first. Structure after.
                </p>
              </>
            ) : (
              <>
                <h1 className="max-w-[30rem] text-[2.05rem] leading-[1.04] font-normal text-aura-foreground-strong text-balance sm:text-[2.8rem]">
                  Keep going.
                </h1>
                <p className="mt-4 max-w-[26rem] text-base leading-relaxed text-muted-foreground text-balance">
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
              <div className="mb-7 h-px w-full bg-aura-divider/75" />
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
