# Design audit: visual baseline

Screenshots of Aura's UI as it stood on 2026-11-06, before the design-system work. They go with
[the audit](../design-system-audit.md).

- `baseline/storybook/`: every Storybook story at 390px (`-phone`) and 1280px (`-desktop`).
  Names are Storybook story ids. `-dark` files show the dark tokens, which the app never
  applies.
- `baseline/app/`: the real app, signed out, including Clerk's sign-in and sign-up modals.
  Signed-in states come from the `Current UI/Pages/Home` stories, which render the real page with
  fixture data.

## Start here

| Screen                      | Phone                                                                      | Desktop                                                                      |
| --------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Home, signed out (real app) | [png](baseline/app/home-signed-out-phone.png)                              | [png](baseline/app/home-signed-out-desktop.png)                              |
| Home, with tasks            | [png](baseline/storybook/current-ui-pages-home--with-tasks-phone.png)      | [png](baseline/storybook/current-ui-pages-home--with-tasks-desktop.png)      |
| Home, with tasks, dark      | [png](baseline/storybook/current-ui-pages-home--with-tasks-dark-phone.png) | [png](baseline/storybook/current-ui-pages-home--with-tasks-dark-desktop.png) |
| Organizing overlay          | [png](baseline/storybook/current-ui-pages-home--organizing-phone.png)      | [png](baseline/storybook/current-ui-pages-home--organizing-desktop.png)      |
| Clerk sign-in (real app)    | [png](baseline/app/clerk-sign-in-phone.png)                                | [png](baseline/app/clerk-sign-in-desktop.png)                                |
| Color tokens and contrast   | [png](baseline/storybook/foundations-color--tokens-phone.png)              | [png](baseline/storybook/foundations-color--tokens-desktop.png)              |
| Typography in use           | [png](baseline/storybook/foundations-typography--in-use-phone.png)         | [png](baseline/storybook/foundations-typography--in-use-desktop.png)         |

## Re-capturing

Start Storybook (`pnpm storybook`) and the app (`pnpm dev`), then:

```bash
node scripts/capture-design-baseline.mjs
```

The script replaces `baseline/`. Run it after a change that should look identical, and compare
with `git diff --stat docs/design-audit` or an image diff tool. Two things change on their own:
the date line on the task list (it shows today) and the Clerk modals (Clerk ships its own
updates).
