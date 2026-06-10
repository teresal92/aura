import { parseTasks } from '@/lib/ai'
import { auth } from '@clerk/nextjs/server'
import type { ParsedTaskResponse } from '@/types/task'
import { z } from 'zod'

const parseTasksBodySchema = z.object({
  input: z.string().trim().min(1),
})

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = parseTasksBodySchema.safeParse(await request.json())
  if (!parsed.success) {
    return Response.json({ error: 'Input is required' }, { status: 400 })
  }

  try {
    const result: ParsedTaskResponse = await parseTasks(parsed.data.input)

    if (!Array.isArray(result.tasks)) {
      return Response.json({ error: 'Invalid AI response' }, { status: 500 })
    }

    return Response.json({ tasks: result.tasks })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to parse tasks' }, { status: 500 })
  }
}
