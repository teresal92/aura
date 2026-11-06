import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import Home from '@/app/page'
import { ALL_TASKS } from '@/stories/fixtures'
import { json, serverError } from '@/stories/mock-api'

// The real home page with Clerk and the API mocked. Signed-in data comes from fixtures, so
// these are the states the app can be in, not a reconstruction of them.

const withTasks = { 'GET /api/tasks': () => json({ tasks: ALL_TASKS }) }

const meta = {
  title: 'Current UI/Pages/Home',
  component: Home,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Home>

export default meta
type Story = StoryObj<typeof meta>

export const SignedOut: Story = {
  name: 'Signed out',
}

export const SignedInEmpty: Story = {
  name: 'Signed in, no tasks',
  parameters: { auth: 'signed-in', api: { 'GET /api/tasks': () => json({ tasks: [] }) } },
}

export const WithTasks: Story = {
  name: 'With tasks',
  parameters: { auth: 'signed-in', api: withTasks },
}

export const WritingFocus: Story = {
  name: 'Writing (focused input)',
  parameters: { auth: 'signed-in', api: withTasks },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('textbox'))
    await userEvent.type(canvas.getByRole('textbox'), 'pick up dry cleaning')
  },
}

export const LoadingTasks: Story = {
  name: 'Loading tasks',
  parameters: { auth: 'signed-in', api: { 'GET /api/tasks': 'pending' } },
}

export const Organizing: Story = {
  parameters: { auth: 'signed-in', api: withTasks, inputLoading: true },
}

export const LoadFailed: Story = {
  name: 'Load failed',
  parameters: { auth: 'signed-in', api: { 'GET /api/tasks': serverError } },
  play: async ({ canvasElement }) => {
    const alert = await within(canvasElement).findByRole('alert')
    await expect(alert).toHaveTextContent("Couldn't load your tasks")
  },
}
