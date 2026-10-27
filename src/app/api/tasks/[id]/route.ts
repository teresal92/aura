import { auth } from '@clerk/nextjs/server'
import { invalidRequest, unauthorized } from '@/lib/api/responses'
import { deleteTask, updateTask } from '@/lib/tasks/repository'
import { taskPatchSchema } from '@/lib/tasks/schema'
import { z } from 'zod'

interface RouteContext {
  params: Promise<{ id: string }>
}

// Postgres throws on an id that isn't a UUID, which would surface as a 500; reject it as bad input.
const idSchema = z.uuid()

const invalidId = () => Response.json({ error: 'Task id must be a UUID' }, { status: 400 })
// Same answer for a missing task and another user's task, so the response doesn't reveal which.
const notFound = () => Response.json({ error: 'Task not found' }, { status: 404 })

export async function PATCH(request: Request, { params }: RouteContext) {
  const { userId } = await auth()
  if (!userId) return unauthorized()

  const { id } = await params
  if (!idSchema.safeParse(id).success) return invalidId()

  // A body that isn't JSON is a bad request, not a server error.
  const body: unknown = await request.json().catch(() => null)
  const parsed = taskPatchSchema.safeParse(body)
  if (!parsed.success) return invalidRequest('A valid task update is required', parsed.error)

  try {
    const task = await updateTask(id, parsed.data)
    if (!task) return notFound()
    return Response.json({ task })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { userId } = await auth()
  if (!userId) return unauthorized()

  const { id } = await params
  if (!idSchema.safeParse(id).success) return invalidId()

  try {
    const deleted = await deleteTask(id)
    if (!deleted) return notFound()
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
