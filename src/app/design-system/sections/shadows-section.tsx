import { Button } from '@/components/ui/button'

const SHADOW_SIZES = ['xs', 'sm', 'md'] as const

export function ShadowsSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Shadows & Motion</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SHADOW_SIZES.map((size) => (
          <div
            key={size}
            className={`rounded-xl border border-border bg-card p-4 aura-shadow-${size}`}
          >
            Shadow {size.toUpperCase()}
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="subtle">Subtle</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
    </section>
  )
}
