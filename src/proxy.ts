import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isApiRoute = createRouteMatcher(['/api/(.*)'])
// Public: each webhook route verifies its own signature.
const isWebhookRoute = createRouteMatcher(['/api/webhooks/(.*)'])

// 401, not auth.protect(): its 404 looks like a missing task.
export default clerkMiddleware(async (auth, req) => {
  if (isApiRoute(req) && !isWebhookRoute(req)) {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
