# Agent Guidance (Aura)

## Vendor UI Policy (`src/components/ui`)

- Treat `src/components/ui` as a vendor/stable layer (shadcn/ui). Avoid direct edits unless required to fix a breaking bug or update upstream.
- Prefer styling via tokens (`src/app/globals.css`) and `className` overrides.
- If customization is needed, create app-level wrappers in `src/components` that compose the shadcn primitives.
- If a direct edit becomes necessary, document the reason in the PR/commit and keep changes minimal.
