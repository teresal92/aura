import { CategoryBadge, MetaText, PriorityBadge, PriorityDot } from '@/components/aura-primitives'

export function PrimitivesSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Aura Primitives</h2>
      <div className="flex items-center gap-4 flex-wrap">
        <PriorityBadge priority="urgent" />
        <PriorityBadge priority="high" />
        <PriorityBadge priority="medium" />
        <PriorityBadge priority="low" />
        <PriorityDot priority="urgent" />
        <PriorityDot priority="low" />
        <CategoryBadge category="Health" />
        <MetaText>Due today</MetaText>
      </div>
    </section>
  )
}
