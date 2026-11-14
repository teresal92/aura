import { verifyWebhook } from '@clerk/nextjs/webhooks'
import type { NextRequest } from 'next/server'
import { deleteUserTasks } from '@/lib/tasks/delete-user-tasks'

// Public (see src/proxy.ts): the signature is the only auth. Clerk retries any non-2xx.
export async function POST(request: NextRequest) {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET
  if (!signingSecret) {
    console.error('CLERK_WEBHOOK_SIGNING_SECRET is not set; cannot verify Clerk webhooks')
    return Response.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event
  try {
    event = await verifyWebhook(request, { signingSecret })
  } catch (error) {
    console.error('Clerk webhook verification failed', error)
    return Response.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  if (event.type !== 'user.deleted') return new Response(null, { status: 200 })

  const userId = event.data.id
  if (!userId) {
    console.error('Clerk user.deleted webhook has no user ID', event.data)
    return Response.json({ error: 'Missing user ID' }, { status: 400 })
  }

  try {
    await deleteUserTasks(userId)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to delete tasks' }, { status: 500 })
  }
  return new Response(null, { status: 200 })
}
