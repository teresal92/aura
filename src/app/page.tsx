'use client'

import { AuraLogo } from '@/components/aura-primitives'
import { TaskInput } from '@/components/TaskInput'
import { TaskList } from '@/components/TaskList'
import { useTaskStore } from '@/store/tasks'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Home() {
  const { tasks } = useTaskStore()
  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <AuraLogo />
          <div className="flex items-center gap-4">
            <SignedIn>
              {tasks.length > 0 ? (
                <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
                  {activeTasks.length > 0 ? <span>{activeTasks.length} active</span> : null}
                  {completedTasks.length > 0 ? (
                    <span className="text-aura-success">{completedTasks.length} done</span>
                  ) : null}
                </div>
              ) : null}
            </SignedIn>
            <div className="flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="aura-btn-subtle" type="button">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="aura-btn-primary" type="button">
                    Sign up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton appearance={{ elements: { avatarBox: 'h-8 w-8' } }} />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {tasks.length === 0 ? (
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl text-balance">
              What&apos;s swirling around in your head?
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto text-balance">
              Just type it all out below. Messy is fine. Half-formed is fine. Aura will turn it into
              a plan.
            </p>
          </div>
        ) : null}

        <div className="mb-8">
          <TaskInput />
        </div>

        <SignedIn>
          <TaskList />
        </SignedIn>
      </div>
    </main>
  )
}
