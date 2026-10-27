import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isApiRoute = createRouteMatcher(['/api/(.*)'])

// API routes answer signed-out requests with a 401 in the routes' { error } shape. auth.protect()
// would return a 404, which the client can't tell apart from a task that doesn't exist.
export default clerkMiddleware(async (auth, req) => {
  if (isApiRoute(req)) {
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
