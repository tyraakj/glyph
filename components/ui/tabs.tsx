"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}) {
  const [tab, setTab] = React.useState(value ?? defaultValue ?? "")

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      setTab(newValue)
      onValueChange?.(newValue)
    },
    [onValueChange]
  )

  React.useEffect(() => {
    if (value !== undefined) {
      setTab(value)
    }
  }, [value])

  return (
    <TabsContext.Provider value={{ value: tab, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl bg-bg-surface p-1 text-text-muted",
        className
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")

  const isSelected = context.value === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-bg-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-bg-elevated text-text-primary shadow-sm"
          : "hover:bg-bg-subtle hover:text-text-secondary",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")

  if (context.value !== value) return null

  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-2 ring-offset-bg-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  )
}
