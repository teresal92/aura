'use client'

import { useEffect, useRef, useState } from 'react'
import type { Task } from '@/types/task'
import { CompletionCheckbox } from '@/components/aura-primitives'
import { getClarificationQueue, organizeTasks } from '@/lib/organize'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/tasks'

type PanelMode = 'review' | 'questions' | 'done'

const monoLabel = 'font-mono text-xs uppercase tracking-widest'
const panelButton = 'min-h-12 px-4.5 py-3 text-left text-lg'

// Post-dump screen: the organized list, plus a side panel that offers the LLM's follow-up
// questions before the user files the list.
export function OrganizedView() {
  const tasks = useTaskStore((state) => state.tasks)
  const organized = organizeTasks(tasks)

  return (
    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
      <div className="flex flex-col gap-7">
        <TaskSection title="Today" tasks={organized.today} />
        <TaskSection title="This week" tasks={organized.week} />
        <TaskSection title="Later" tasks={organized.later} />

        {organized.unsure.length > 0 ? (
          <section className="flex flex-col gap-2.5">
            <h2 className={cn(monoLabel, 'font-medium text-flag')}>Not sure where these go</h2>
            <ul role="list">
              {organized.unsure.map((task) => (
                <li
                  key={task.id}
                  className="flex items-start gap-3.5 border-b border-dashed border-border py-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 rounded-full border-[1.5px] border-dashed border-flag"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-heading text-2xl font-medium italic leading-snug">
                      {task.title}
                    </span>
                    <span className="font-mono text-xs text-flag">
                      {task.clarification?.label ?? 'needs a closer look'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {/* On small screens the panel leads, so the follow-up prompt isn't buried below the list. */}
      <aside className="-order-1 border border-foreground bg-surface p-6 lg:sticky lg:top-8 lg:order-none">
        <FollowUpPanel tasks={tasks} />
      </aside>
    </div>
  )
}

function TaskSection({ title, tasks }: { title: string; tasks: Task[] }) {
  if (tasks.length === 0) return null

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className={cn(monoLabel, 'font-medium text-foreground')}>{title}</h2>
      <ul role="list">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskRow task={task} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function TaskRow({ task }: { task: Task }) {
  const { completeTask, uncompleteTask } = useTaskStore()

  return (
    <label className="flex cursor-pointer items-start gap-3.5 border-b border-dashed border-border py-3">
      <CompletionCheckbox
        checked={task.completed}
        onChange={() => (task.completed ? uncompleteTask(task.id) : completeTask(task.id))}
        className="mt-1 size-5"
      />
      <span className="flex flex-col gap-0.5">
        <span
          className={cn(
            'font-heading text-2xl font-medium leading-snug',
            task.completed && 'text-muted-foreground line-through'
          )}
        >
          {task.title}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {task.category.toLowerCase()}
        </span>
      </span>
    </label>
  )
}

function FollowUpPanel({ tasks }: { tasks: Task[] }) {
  const { answerClarifications, endReview } = useTaskStore()
  const [mode, setMode] = useState<PanelMode>('review')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showMore, setShowMore] = useState(false)
  const [appliedCount, setAppliedCount] = useState(0)
  const headingRef = useRef<HTMLSpanElement>(null)
  const hasMounted = useRef(false)

  // Each mode swaps the panel's content, so move focus to its heading for keyboard/SR users.
  useEffect(() => {
    if (hasMounted.current) headingRef.current?.focus()
    hasMounted.current = true
  }, [mode])

  const { required, optional } = getClarificationQueue(tasks)
  const hasQuestions = required.length + optional.length > 0
  // With no loose ends, "Ask follow-up questions" goes straight to the optional ones.
  const questions = showMore || required.length === 0 ? [...required, ...optional] : required
  const canAskMore = !showMore && required.length > 0 && optional.length > 0

  function finish(applied: Record<string, string>) {
    answerClarifications(applied)
    setAppliedCount(Object.keys(applied).length)
    setMode('done')
  }

  function backToReview() {
    setAnswers({})
    setShowMore(false)
    setMode('review')
  }

  function pick(taskId: string, option: string) {
    setAnswers((current) => {
      const next = { ...current }
      if (next[taskId] === option) delete next[taskId]
      else next[taskId] = option
      return next
    })
  }

  if (mode === 'questions') {
    return (
      <div className="flex flex-col gap-5">
        <span ref={headingRef} tabIndex={-1} className={cn(monoLabel, 'text-flag outline-none')}>
          Answer any, skip any
        </span>

        {questions.map((task) => (
          <fieldset key={task.id} className="flex flex-col gap-2.5">
            <legend className="mb-2.5 font-heading text-xl font-medium leading-snug">
              {task.clarification?.question}
            </legend>
            <div className="flex flex-wrap gap-2">
              {task.clarification?.options.map((option) => {
                const pressed = answers[task.id] === option
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => pick(task.id, option)}
                    className={cn(
                      'min-h-11 px-3.5 py-2.5 text-base',
                      pressed
                        ? 'bg-foreground text-background'
                        : 'border-muted-foreground bg-transparent'
                    )}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}

        {canAskMore ? (
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="min-h-11 self-start border-dashed border-flag px-3.5 py-2.5 text-base text-flag"
          >
            + Ask me more
          </button>
        ) : null}

        <div className="flex gap-2.5 border-t border-dashed border-border pt-4">
          <button
            type="button"
            onClick={() => finish(answers)}
            className={cn('aura-btn-primary flex-1', panelButton, 'text-center')}
          >
            Update list
          </button>
          <button type="button" onClick={() => finish({})} className={panelButton}>
            Skip
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'done') {
    return (
      <div className="flex flex-col gap-3.5">
        <span ref={headingRef} tabIndex={-1} className={cn(monoLabel, 'outline-none')}>
          Filed
        </span>
        <p className="font-heading text-2xl leading-snug">
          {appliedCount > 0
            ? `Updated with ${appliedCount} ${appliedCount === 1 ? 'answer' : 'answers'}. Loose ends moved into place.`
            : required.length > 0
              ? 'Kept as is. The loose ends stay marked so you can sort them later.'
              : 'All filed. Your list is ready.'}
        </p>
        <div className="flex flex-col items-start gap-2">
          {hasQuestions ? (
            <button type="button" onClick={backToReview} className={textLink}>
              Back to review
            </button>
          ) : null}
          <button type="button" onClick={endReview} className={textLink}>
            Start a new dump
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <span
        ref={headingRef}
        tabIndex={-1}
        className={cn(monoLabel, 'outline-none', required.length > 0 && 'text-flag')}
      >
        {required.length > 0
          ? `${required.length} loose ${required.length === 1 ? 'end' : 'ends'}`
          : 'All sorted'}
      </span>
      <p className="font-heading text-2xl leading-snug">
        {reviewCopy(required.length, optional.length)}
      </p>
      {hasQuestions ? (
        <>
          <button
            type="button"
            onClick={() => setMode('questions')}
            className={cn('aura-btn-primary', panelButton)}
          >
            Ask follow-up questions
          </button>
          <button type="button" onClick={() => finish({})} className={panelButton}>
            Continue as is
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => finish({})}
          className={cn('aura-btn-primary', panelButton)}
        >
          Continue
        </button>
      )}
    </div>
  )
}

const textLink =
  'min-h-11 border-none p-0 text-base text-flag underline underline-offset-2 hover:bg-transparent hover:text-foreground'

function reviewCopy(looseEnds: number, optional: number) {
  if (looseEnds === 1)
    return "Everything's sorted. One thing I wasn't sure about — want to tighten it up?"
  if (looseEnds === 2)
    return "Everything's sorted. A couple of things I wasn't sure about — want to tighten them up?"
  if (looseEnds > 2)
    return "Everything's sorted. A few things I wasn't sure about — want to tighten them up?"
  if (optional > 0) return "Everything's sorted. I have a question or two if you want to fine-tune."
  return "Everything's sorted."
}
