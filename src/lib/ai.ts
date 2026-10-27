import 'server-only'

import Anthropic from '@anthropic-ai/sdk'
import { todayIn } from '@/lib/dates'
import { TASK_PARSER_SYSTEM_PROMPT } from '@/lib/prompts'
import { parsedTaskSchema } from '@/lib/tasks/schema'
import type { ParsedTaskResponse } from '@/types/task'

const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-6'

function extractJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1))
    }
    throw new Error('Unable to parse JSON from AI response')
  }
}

// The weekday helps the model resolve "Friday"; it is unreliable at deriving it.
function buildUserContent(input: string, timeZone: string): string {
  const now = new Date()
  const today = todayIn(timeZone, now)
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone }).format(now)
  return `Today is ${weekday}, ${today} (${timeZone}).\n\n${input}`
}

export async function parseTasks(input: string, timeZone: string): Promise<ParsedTaskResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL
  const client = new Anthropic({ apiKey })

  const userContent = buildUserContent(input, timeZone)

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: TASK_PARSER_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userContent }],
  })

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  )
  if (!textBlock) throw new Error('Anthropic returned no content')

  return parsedTaskSchema.parse(extractJson(textBlock.text))
}
