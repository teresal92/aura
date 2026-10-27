import { auth } from '@clerk/nextjs/server'
import { invalidRequest, unauthorized } from '@/lib/api/responses'
import { createTasks, listTasks } from '@/lib/tasks/repository'
import { newTaskSchema } from '@/lib/tasks/schema'
import { z } from 'zod'

const createTasksBodySchema = z.object({
  tasks: z.array(newTaskSchema),
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) return unauthorized()

  try {
    const tasks = await listTasks()
    return Response.json({ tasks })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to load tasks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return unauthorized()

  // A body that isn't JSON is a bad request, not a server error.
  const body: unknown = await request.json().catch(() => null)
  const parsed = createTasksBodySchema.safeParse(body)
  if (!parsed.success) return invalidRequest('A valid tasks array is required', parsed.error)

  try {
    const tasks = await createTasks(parsed.data.tasks)
    return Response.json({ tasks }, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to save tasks' }, { status: 500 })
  }
}
