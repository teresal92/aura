import type { z } from 'zod'

// Error responses shared by the API routes, so every route speaks the same error contract.

export function unauthorized(): Response {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}

/** 400 with each issue's path (e.g. ["tasks", 1, "title"]) so the client can tell which field failed. */
export function invalidRequest(error: string, zodError: z.ZodError): Response {
  const issues = zodError.issues.map(({ path, message }) => ({ path, message }))
  return Response.json({ error, issues }, { status: 400 })
}
