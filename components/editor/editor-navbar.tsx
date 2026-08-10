import * as React from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./user-menu"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function EditorNavbar({ isSidebarOpen, onToggleSidebar }: EditorNavbarProps) {
  return (
    <nav className="flex h-14 items-center justify-between border-b border-border-subtle bg-bg-base px-4">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="text-text-secondary hover:text-text-primary"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Center Section */}
      <div className="flex items-center">
        {/* Workspace title or other central elements will go here */}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        <UserMenu />
      </div>
    </nav>
  )
}
