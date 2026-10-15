// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { OrganizedView } from '@/components/OrganizedView'
import { createPreviewTasks } from '@/lib/preview-tasks'
import { useTaskStore } from '@/store/tasks'

function section(name: string) {
  return screen.getByRole('heading', { name }).closest('section') as HTMLElement
}

describe('OrganizedView', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: createPreviewTasks(), isReviewing: true })
  })

  afterEach(cleanup)

  it('lists loose ends separately and offers follow-up questions', () => {
    render(<OrganizedView />)

    expect(within(section('Not sure where these go')).getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('2 loose ends')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ask follow-up questions' })).toBeTruthy()
  })

  it('keeps loose ends marked when continuing as is', () => {
    render(<OrganizedView />)

    fireEvent.click(screen.getByRole('button', { name: 'Continue as is' }))

    expect(screen.getByText(/Kept as is/)).toBeTruthy()
    expect(within(section('Not sure where these go')).getAllByRole('listitem')).toHaveLength(2)
  })

  it('moves answered loose ends into the list and reveals optional questions on request', () => {
    render(<OrganizedView />)

    fireEvent.click(screen.getByRole('button', { name: 'Ask follow-up questions' }))
    expect(screen.queryByText(/Vet appointment/)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '+ Ask me more' }))
    expect(screen.getByText(/Vet appointment/)).toBeTruthy()

    const picked = screen.getByRole('button', { name: 'Yes, Tahoe trip' })
    fireEvent.click(picked)
    expect(picked.getAttribute('aria-pressed')).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: 'Update list' }))

    expect(screen.getByText(/Updated with 1 answer\./)).toBeTruthy()
    expect(
      within(section('Not sure where these go')).queryByText('Call Dana about the cabin')
    ).toBeNull()
    expect(screen.getByText('Call Dana about the cabin')).toBeTruthy()
  })
})
