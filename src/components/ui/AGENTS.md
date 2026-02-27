# UI Layer Guidance (`src/components/ui`)

Scope: this file applies only inside `src/components/ui`.

- Treat this directory as a stable primitive/vendor-like layer.
- Prefer app-level composition in `src/components/*` over direct edits here.
- Prefer token/class overrides from `src/app/globals.css` and consumer `className` props.
- Keep primitives generic; avoid product-specific business logic in this folder.
- If a direct edit is required, keep it minimal and document the reason in PR notes.
