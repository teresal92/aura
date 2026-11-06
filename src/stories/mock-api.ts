// Storybook only: stubs `fetch` for the app's own `/api/*` routes, per story, with `parameters.api`.
// Keys are "METHOD /path"; a trailing "/*" matches one more path segment ("PATCH /api/tasks/*").

export interface ApiRequest {
  method: string
  path: string
  body: unknown
}

/** A handler, or `'pending'` for a request that never settles (shows loading states). */
export type ApiRoute = ((request: ApiRequest) => Response | Promise<Response>) | 'pending'

export type ApiRoutes = Record<string, ApiRoute>

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const serverError = () => json({ error: 'Storybook: simulated failure' }, 500)

function findRoute(routes: ApiRoutes, method: string, path: string): ApiRoute | undefined {
  const exact = routes[`${method} ${path}`]
  if (exact) return exact
  const parent = path.slice(0, path.lastIndexOf('/'))
  return routes[`${method} ${parent}/*`]
}

/** Installs the stub and returns a cleanup that restores the real `fetch`. */
export function installApiMock(routes: ApiRoutes): () => void {
  const realFetch = globalThis.fetch

  globalThis.fetch = async (input, init) => {
    const url = new URL(
      input instanceof Request ? input.url : String(input),
      globalThis.location.href
    )
    if (!url.pathname.startsWith('/api/')) return realFetch(input, init)

    const method = (init?.method ?? 'GET').toUpperCase()
    const route = findRoute(routes, method, url.pathname)
    if (!route) return json({ error: `Storybook: no mock for ${method} ${url.pathname}` }, 404)
    if (route === 'pending') return new Promise<Response>(() => {})

    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : null
    return route({ method, path: url.pathname, body })
  }

  return () => {
    globalThis.fetch = realFetch
  }
}
