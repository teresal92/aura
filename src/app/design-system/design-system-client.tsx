'use client'

import { ComponentsSection } from './sections/components-section'
import { PrimitivesSection } from './sections/primitives-section'
import { ShadowsSection } from './sections/shadows-section'
import { TokensSection } from './sections/tokens-section'

export function DesignSystemClient() {
  return (
    <>
      <TokensSection />
      <ShadowsSection />
      <PrimitivesSection />
      <ComponentsSection />
    </>
  )
}
