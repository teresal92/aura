import { parseTasks } from '@/lib/ai'
import type { ParsedTaskResponse } from '@/types/task'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { input?: string }
    const input = body.input?.trim()
    if (!input) {
      return Response.json({ error: 'Input is required' }, { status: 400 })
    }

    const result: ParsedTaskResponse = await parseTasks(input)

    if (!Array.isArray(result.tasks)) {
      return Response.json({ error: 'Invalid AI response' }, { status: 500 })
    }

    return Response.json({ tasks: result.tasks })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to parse tasks' }, { status: 500 })
  }
}
