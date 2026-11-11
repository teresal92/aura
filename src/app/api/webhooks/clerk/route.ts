import { verifyWebhook } from '@clerk/nextjs/webhooks'
import type { NextRequest } from 'next/server'
import { deleteUserTasks } from '@/lib/tasks/delete-user-tasks'

// Clerk webhooks, delivered by Svix at least once and retried on any non-2xx. Public in
// src/proxy.ts: there's no session, so the signature is the only authentication.
export async function POST(request: NextRequest) {
  let event
  try {
    // Reads CLERK_WEBHOOK_SIGNING_SECRET.
    event = await verifyWebhook(request)
  } catch (error) {
    console.error('Clerk webhook verification failed', error)
    return Response.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  // Acknowledge everything else so Clerk stops retrying.
  if (event.type !== 'user.deleted') return new Response(null, { status: 200 })

  const userId = event.data.id
  if (!userId) {
    console.error('Clerk user.deleted webhook has no user ID', event.data)
    return Response.json({ error: 'Missing user ID' }, { status: 400 })
  }

  try {
    // Idempotent, so a repeat delivery deletes nothing and still succeeds.
    await deleteUserTasks(userId)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to delete tasks' }, { status: 500 })
  }
  return new Response(null, { status: 200 })
}
