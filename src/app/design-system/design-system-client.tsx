'use client'

import * as React from 'react'
import {
  AuraLogo,
  CategoryBadge,
  MetaText,
  PriorityBadge,
  PriorityDot,
} from '@/components/aura-primitives'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Dropdown, DropdownItem } from '@/components/ui/dropdown'

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

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Tokens</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {[
              ['Background', 'var(--background)'],
              ['Foreground', 'var(--foreground)'],
              ['Primary', 'var(--primary)'],
              ['Secondary', 'var(--secondary)'],
              ['Muted', 'var(--muted)'],
              ['Border', 'var(--border)'],
              ['Urgent', 'var(--aura-urgent)'],
              ['High', 'var(--aura-high)'],
              ['Medium', 'var(--aura-medium)'],
              ['Low', 'var(--aura-low)'],
            ].map(([label, value]) => (
              <div key={label} className="space-y-2">
                <div
                  className="h-12 rounded-xl border border-border"
                  style={{ background: value }}
                />
                <div>
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Shadows & Motion</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4 aura-shadow-xs">
              Shadow XS
            </div>
            <div className="rounded-xl border border-border bg-card p-4 aura-shadow-sm">
              Shadow SM
            </div>
            <div className="rounded-xl border border-border bg-card p-4 aura-shadow-md">
              Shadow MD
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="subtle">Subtle</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </section>

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

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Component Examples</h2>
          <Card>
            <CardHeader>
              <CardTitle>Task Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="What’s on your mind?" />
              <div className="flex items-center gap-3">
                <Checkbox />
                <span className="text-sm">Mark as complete</span>
              </div>
              <Tabs defaultValue="today">
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">This Week</TabsTrigger>
                </TabsList>
                <TabsContent value="today">
                  <div className="text-sm text-muted-foreground">Today tasks</div>
                </TabsContent>
                <TabsContent value="week">
                  <div className="text-sm text-muted-foreground">Week tasks</div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <div className="flex items-center gap-3">
            <Dropdown trigger={<Button variant="subtle">Open menu</Button>}>
              <DropdownItem>Profile</DropdownItem>
              <DropdownItem>Settings</DropdownItem>
              <DropdownItem>Log out</DropdownItem>
            </Dropdown>
            <DialogDemo />
          </div>
        </section>
      </div>
    </div>
  )
}

function DialogDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Focus Mode</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This is a lightweight dialog primitive styled with Aura tokens.
          </p>
          <DialogFooter>
            <Button variant="subtle" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
