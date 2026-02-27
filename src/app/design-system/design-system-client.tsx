'use client'

import { AuraLogo } from '@/components/aura-primitives'
import { Badge } from '@/components/ui/badge'
import { ComponentsSection } from './sections/components-section'
import { PrimitivesSection } from './sections/primitives-section'
import { ShadowsSection } from './sections/shadows-section'
import { TokensSection } from './sections/tokens-section'

export function DesignSystemClient() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-16">
        <header className="flex items-center justify-between">
          <AuraLogo />
          <Badge variant="secondary">Design System</Badge>
        </header>

        <section className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">Aura Design System</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Warm neutral palette, soft rounded shapes, muted typography, and subtle shadows.
          </p>
        </section>

        <TokensSection />
        <ShadowsSection />
        <PrimitivesSection />
        <ComponentsSection />
      </div>
    </div>
  )
}
