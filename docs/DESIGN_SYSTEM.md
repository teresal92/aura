# Aura Design System

**Source of truth:** `src/app/globals.css` defines Aura tokens, shadows, and motion.

**How to use tokens**

- Use Tailwind colors like `bg-background`, `text-foreground`, `border-border`.
- Use Aura semantic colors like `bg-aura-urgent/10`, `text-aura-success`.
- Use aura utilities: `aura-shadow-sm`, `aura-transition-fast`, `aura-focus-ring`.

**Adding components**

1. Prefer using `src/components/ui/*` primitives and compose variants.
2. Keep styles token-driven (no hardcoded hex values).
3. If you add a new token, document it in `src/app/globals.css` and the `/design-system` page.

**Theming rules**

- Light/dark tokens live in `src/app/globals.css` under `:root` and `.dark`.
- Use class-based dark mode by toggling `.dark` on `<html>`.
