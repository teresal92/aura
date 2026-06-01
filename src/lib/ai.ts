import 'server-only'

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodTextFormat } from 'openai/helpers/zod'
import { TASK_PARSER_SYSTEM_PROMPT } from '@/lib/prompts'
import type { ParsedTaskResponse } from '@/types/task'

type Provider = 'openai' | 'anthropic'

const DEFAULT_OPENAI_MODEL = 'gpt-5-mini'
const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-6'

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

async function parseWithAnthropic(input: string): Promise<ParsedTaskResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL
  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: TASK_PARSER_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: input }],
  })

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  )
  if (!textBlock) throw new Error('Anthropic returned no content')

  return extractJson(textBlock.text)
}
