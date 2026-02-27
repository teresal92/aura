import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Dropdown, DropdownItem } from '@/components/ui/dropdown'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ComponentsSection() {
  return (
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
