import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { TaskInput } from '@/components/TaskInput'
import { BRAIN_DUMP, PARSED_TASKS } from '@/stories/fixtures'
import { json, serverError } from '@/stories/mock-api'

const meta = {
  title: 'Current UI/Components/TaskInput',
  component: TaskInput,
  parameters: { auth: 'signed-in' },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskInput>

export default meta
type Story = StoryObj<typeof meta>

async function submitDump(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await userEvent.type(canvas.getByRole('textbox'), BRAIN_DUMP)
  await userEvent.click(canvas.getByRole('button', { name: 'Organize tasks' }))
  return canvas
}

export const Empty: Story = {}

export const WithText: Story = {
  name: 'With text',
  play: async ({ canvasElement }) => {
    await userEvent.type(within(canvasElement).getByRole('textbox'), BRAIN_DUMP)
  },
}

export const Organizing: Story = {
  parameters: { inputLoading: true },
}

export const ParseFailed: Story = {
  name: 'Parse failed',
  parameters: { api: { 'POST /api/parse-tasks': serverError } },
  play: async ({ canvasElement }) => {
    const canvas = await submitDump(canvasElement)
    await expect(await canvas.findByRole('alert')).toHaveTextContent("Couldn't organize that")
  },
}

export const NoTasksFound: Story = {
  name: 'No tasks found',
  parameters: { api: { 'POST /api/parse-tasks': () => json({ tasks: [] }) } },
  play: async ({ canvasElement }) => {
    const canvas = await submitDump(canvasElement)
    await expect(await canvas.findByRole('alert')).toHaveTextContent("Couldn't find any tasks")
  },
}

export const SaveFailed: Story = {
  name: 'Save failed',
  parameters: {
    api: {
      'POST /api/parse-tasks': () => json({ tasks: PARSED_TASKS }),
      'POST /api/tasks': serverError,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = await submitDump(canvasElement)
    await expect(await canvas.findByRole('button', { name: 'Try again' })).toBeVisible()
  },
}
