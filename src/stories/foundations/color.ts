// Resolves CSS colors (any syntax, including oklch() and var()) to sRGB in the browser, and
// computes WCAG 2 contrast. Only for Storybook's Foundations pages.

export type Rgba = [r: number, g: number, b: number, a: number]

let context: CanvasRenderingContext2D | null = null

/** The rendered color of a CSS color value, read back from a 1×1 canvas. */
export function resolveColor(cssColor: string, element: Element = document.body): Rgba {
  const probe = document.createElement('span')
  probe.style.color = cssColor
  element.appendChild(probe)
  const computed = getComputedStyle(probe).color
  probe.remove()

  context ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!context) return [0, 0, 0, 1]
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = computed
  context.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data
  return [r, g, b, a / 255]
}

/** Flattens a translucent color onto an opaque background. */
export function composite([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1]
}

function luminance([r, g, b]: Rgba): number {
  const channel = (value: number) => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrast(foreground: Rgba, background: Rgba): number {
  const fg = luminance(composite(foreground, background))
  const bg = luminance(background)
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)
}

export function toHex([r, g, b, a]: Rgba): string {
  const hex = [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
  return a < 1 ? `#${hex} @ ${Math.round(a * 100)}%` : `#${hex}`
}
