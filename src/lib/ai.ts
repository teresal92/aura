import 'server-only'

import OpenAI from 'openai'
import { z } from 'zod'
import { zodTextFormat } from 'openai/helpers/zod'
import { TASK_PARSER_SYSTEM_PROMPT } from '@/lib/prompts'
import type { ParsedTaskResponse } from '@/types/task'

type Provider = 'openai' | 'anthropic'

const DEFAULT_OPENAI_MODEL = 'gpt-5-mini'
const DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-sonnet-20241022'

function extractJson(text: string): ParsedTaskResponse {
  try {
    return JSON.parse(text) as ParsedTaskResponse
  } catch {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1)) as ParsedTaskResponse
    }
    throw new Error('Unable to parse JSON from AI response')
  }
}

function getProvider(): Provider {
  const raw = process.env.AI_PROVIDER?.toLowerCase()
  if (raw === 'anthropic') return 'anthropic'
  return 'openai'
}

export async function parseTasks(input: string): Promise<ParsedTaskResponse> {
  const provider = getProvider()
  if (provider === 'anthropic') {
    return parseWithAnthropic(input)
  }
  const result = await parseWithOpenAI(input)
  const normalized = {
    tasks: result.tasks.map((task) => ({
      ...task,
      dueDate: task.dueDate ?? null,
      notes: task.notes ?? null,
      subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
    })),
  }
  return normalized
}

async function parseWithOpenAI(input: string): Promise<ParsedTaskResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

  const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL
  const client = new OpenAI({ apiKey })

  const taskSchema = z.object({
    tasks: z.array(
      z.object({
        title: z.string(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']),
        estimatedDuration: z.number(),
        dueDate: z.string().nullable(),
        category: z.string(),
        subtasks: z.array(z.string()),
        notes: z.string().nullable(),
      })
    ),
  })

  const response = await client.responses.parse({
    model,
    input: [
      { role: 'system', content: TASK_PARSER_SYSTEM_PROMPT },
      { role: 'user', content: input },
    ],
    text: {
      format: zodTextFormat(taskSchema, 'task_parse'),
    },
  })

  if (!response.output_parsed) throw new Error('OpenAI returned no content')

  return response.output_parsed as ParsedTaskResponse
}

// TODO: need to validate Anthropic API
async function parseWithAnthropic(input: string): Promise<ParsedTaskResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      temperature: 0.2,
      system: TASK_PARSER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: input }],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Anthropic error: ${response.status} ${errorText}`)
  }

  const payload = (await response.json()) as {
    content?: { type: string; text?: string }[]
  }
  const text = payload.content?.find((item) => item.type === 'text')?.text
  if (!text) throw new Error('Anthropic returned no content')

  return extractJson(text)
}
