'use client'

import { useState } from 'react'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { AuraLogo } from '@/components/aura-primitives'
import { TaskInput } from '@/components/TaskInput'
import { TaskList } from '@/components/TaskList'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/tasks'

export default function Home() {
  const [isWritingFocused, setIsWritingFocused] = useState(false)
  const { tasks } = useTaskStore()
  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <main
      className={cn(
        'min-h-screen bg-background transition-colors duration-300',
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

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center pb-6 pt-10 sm:pt-12">
          <div
            className={cn(
              'mb-8 text-center transition-all duration-300',
              isWritingFocused ? 'translate-y-1 opacity-45' : 'opacity-80'
            )}
          >
            {tasks.length === 0 ? (
              <>
                <h1 className="text-[2rem] leading-tight font-bold text-aura-foreground-strong sm:text-[2.6rem] text-balance">
                  What&apos;s swirling around in your head?
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground text-balance">
                  Just type it all out below. Messy is fine. Half-formed is fine. Aura will turn it
                  into a plan.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-[1.7rem] leading-tight font-bold text-aura-foreground-strong sm:text-[2.2rem] text-balance">
                  Keep laying it out.
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground text-balance">
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
    </main>
  )
}
