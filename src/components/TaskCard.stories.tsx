import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { TaskCard } from '@/components/TaskCard'
import { ACTIVE_TASKS, DONE_TASKS } from '@/stories/fixtures'
import { json, serverError, type ApiRequest } from '@/stories/mock-api'

const meta = {
  title: 'Current UI/Components/TaskCard',
  component: TaskCard,
  parameters: {
    auth: 'signed-in',
    api: {
      'PATCH /api/tasks/*': ({ body }: ApiRequest) =>
        json({ task: { ...ACTIVE_TASKS[0], ...(body as object) } }),
      'DELETE /api/tasks/*': () => new Response(null, { status: 204 }),
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskCard>

export default meta
type Story = StoryObj<typeof meta>

export const WithDetails: Story = {
  name: 'With subtasks and notes',
  args: { task: ACTIVE_TASKS[0] },
}

export const TitleAndMeta: Story = {
  name: 'Title and meta only',
  args: { task: ACTIVE_TASKS[2] },
}

export const Completed: Story = {
  args: { task: DONE_TASKS[0] },
}

export const ChangeFailed: Story = {
  name: 'Change failed',
  args: { task: ACTIVE_TASKS[1] },
  parameters: { api: { 'PATCH /api/tasks/*': serverError } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('checkbox'))
    await expect(await canvas.findByRole('alert')).toHaveTextContent("Couldn't save that change")
  },
}
