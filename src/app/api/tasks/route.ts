import { auth } from '@clerk/nextjs/server'
import { createTasks, listTasks } from '@/lib/tasks/repository'
import { newTaskSchema } from '@/lib/tasks/schema'
import { z } from 'zod'

const createTasksBodySchema = z.object({
  tasks: z.array(newTaskSchema),
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // A body that isn't JSON is a bad request, not a server error.
  const body: unknown = await request.json().catch(() => null)
  const parsed = createTasksBodySchema.safeParse(body)
  if (!parsed.success) {
    // Each issue's path (e.g. ["tasks", 1, "title"]) tells the client which task and field failed.
    const issues = parsed.error.issues.map(({ path, message }) => ({ path, message }))
    return Response.json({ error: 'A valid tasks array is required', issues }, { status: 400 })
  }

  try {
    const tasks = await createTasks(parsed.data.tasks)
    return Response.json({ tasks }, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to save tasks' }, { status: 500 })
  }
}
