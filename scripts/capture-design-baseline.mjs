// Screenshots every Storybook story, plus the real app's signed-out screens, at phone and
// desktop widths. The output is the visual baseline for the design-system work: re-run it after
// a change that should look identical and compare.
//
// Needs Storybook (`pnpm storybook`) and the app (`pnpm dev`) running. Then:
//   node scripts/capture-design-baseline.mjs [--out docs/design-audit/baseline]
//     [--storybook http://localhost:6006] [--app http://localhost:3000]

import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { chromium } from 'playwright'

const { values: options } = parseArgs({
  options: {
    out: { type: 'string', default: 'docs/design-audit/baseline' },
    storybook: { type: 'string', default: 'http://localhost:6006' },
    app: { type: 'string', default: 'http://localhost:3000' },
  },
})

const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
}

// Dark tokens exist but the app never applies them; capture a few stories to show what they do.
const DARK_STORIES = ['foundations-color--tokens', 'current-ui-pages-home--with-tasks']

// Full-page captures stretch the page but not a `position: fixed` overlay, which then covers
// only the top. Overlay states are captured at viewport size, as the user sees them.
const OVERLAY_STORIES = [
  'current-ui-pages-home--loading-tasks',
  'current-ui-pages-home--organizing',
]

async function settle(page) {
  await page.waitForLoadState('networkidle')
  // Next's dev-tools badge isn't part of the app.
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
  await page.evaluate(() => document.fonts.ready)
  // Play functions type and click after render; give them time to finish.
  await page.waitForTimeout(1500)
}

async function shoot(page, file, { fullPage = true } = {}) {
  await page.screenshot({ path: file, fullPage, animations: 'disabled' })
  console.log(`  ${path.relative(process.cwd(), file)}`)
}

async function captureStories(browser, viewportName, viewport) {
  const index = await fetch(`${options.storybook}/index.json`).then((r) => r.json())
  const stories = Object.values(index.entries).filter((entry) => entry.type === 'story')

  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
  const page = await context.newPage()

  for (const story of stories) {
    const themes = DARK_STORIES.includes(story.id) ? ['light', 'dark'] : ['light']
    for (const theme of themes) {
      const url = `${options.storybook}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`
      await page.goto(url)
      await page.locator('#storybook-root > *').first().waitFor()
      await settle(page)
      const suffix = theme === 'dark' ? '-dark' : ''
      const file = path.join(options.out, 'storybook', `${story.id}${suffix}-${viewportName}.png`)
      await shoot(page, file, { fullPage: !OVERLAY_STORIES.includes(story.id) })
    }
  }
  await context.close()
}

// Only signed-out screens: signed-in states come from the page stories, which render the real
// page with fixture data.
async function captureApp(browser, viewportName, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const out = (name) => path.join(options.out, 'app', `${name}-${viewportName}.png`)

  await page.goto(options.app)
  await settle(page)
  await shoot(page, out('home-signed-out'))

  for (const [button, name] of [
    ['Sign in', 'clerk-sign-in'],
    ['Sign up', 'clerk-sign-up'],
  ]) {
    await page.goto(options.app)
    await page.getByRole('button', { name: button, exact: true }).click()
    await page.locator('.cl-cardBox').waitFor()
    await settle(page)
    await shoot(page, out(name))
  }
  await context.close()
}

await rm(options.out, { recursive: true, force: true })
await mkdir(path.join(options.out, 'storybook'), { recursive: true })
await mkdir(path.join(options.out, 'app'), { recursive: true })

const browser = await chromium.launch()
try {
  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    console.log(`${name} (${viewport.width}×${viewport.height})`)
    await captureStories(browser, name, viewport)
    await captureApp(browser, name, viewport)
  }
} finally {
  await browser.close()
}
