// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskInput } from '@/components/TaskInput'
import { TaskList } from '@/components/TaskList'
import { useTaskStore } from '@/store/tasks'

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true }),
  useClerk: () => ({ openSignIn: vi.fn() }),
}))

const parsedTask = {
  title: 'Call mom',
  priority: 'high',
  estimatedDuration: 15,
  dueDate: null,
  category: 'Communication',
  subtasks: [],
  notes: null,
}

describe('TaskInput', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [], isInputLoading: false })
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ tasks: [parsedTask] }))
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('shows parsed tasks in the list after organizing', async () => {
    render(
      <>
        <TaskInput />
        <TaskList />
      </>
    )

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'call my mom' } })
    fireEvent.click(screen.getByRole('button', { name: 'Organize tasks' }))

    expect(await screen.findByRole('heading', { name: 'Call mom' })).toBeTruthy()
    expect(fetch).toHaveBeenCalledWith('/api/parse-tasks', expect.anything())
  })
})
