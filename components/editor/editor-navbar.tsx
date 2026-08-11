import * as React from "react"
import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles, Library, Keyboard, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./user-menu"
import type { Project } from "@/generated/prisma"
import { StarterTemplatesModal } from "./starter-templates-modal"
import { ShareDialog } from "./share-dialog"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  activeProject?: Project
  isAiSidebarOpen?: boolean
  onToggleAiSidebar?: () => void
  onToggleShortcuts?: () => void
}

export function EditorNavbar({ isSidebarOpen, onToggleSidebar, activeProject, isAiSidebarOpen, onToggleAiSidebar, onToggleShortcuts }: EditorNavbarProps) {
  const [showTemplates, setShowTemplates] = React.useState(false)
  const [showShare, setShowShare] = React.useState(false)
  
  // Theme state
  const [isLightMode, setIsLightMode] = React.useState(false)

  React.useEffect(() => {
    setIsLightMode(document.documentElement.classList.contains('light'))
  }, [])

  const toggleTheme = () => {
    const isLight = document.documentElement.classList.contains('light')
    if (isLight) {
      document.documentElement.classList.remove('light')
      localStorage.setItem('glyph-theme', 'dark')
      setIsLightMode(false)
    } else {
      document.documentElement.classList.add('light')
      localStorage.setItem('glyph-theme', 'light')
      setIsLightMode(true)
    }
  }

  return (
    <>
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
          {activeProject ? (
            <span className="text-sm font-semibold text-text-primary">
              {activeProject.name}
            </span>
          ) : (
            <span className="text-sm font-medium text-text-muted">
              Dashboard
            </span>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {activeProject && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)} className="flex border-border-subtle text-text-secondary hover:text-text-primary">
                <Library className="mr-2 h-4 w-4" />
                Templates
              </Button>
              <Button variant="default" size="sm" onClick={() => setShowShare(true)} className="flex">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`text-text-secondary hover:text-text-primary flex ${isAiSidebarOpen ? 'bg-accent-primary/10 text-accent-primary hover:text-accent-primary' : ''}`}
                onClick={onToggleAiSidebar}
                title="AI Workspace"
              >
                <Sparkles className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-text-secondary hover:text-text-primary flex"
                onClick={onToggleShortcuts}
                title="Keyboard Shortcuts"
              >
                <Keyboard className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-text-secondary hover:text-text-primary flex"
                onClick={toggleTheme}
                title="Toggle Theme"
              >
                {isLightMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <div className="h-6 w-px bg-border-subtle mx-2" />
            </>
          )}
          {!activeProject && <UserMenu />}
        </div>
      </nav>

      <StarterTemplatesModal open={showTemplates} onOpenChange={setShowTemplates} />
      
      {activeProject && (
        <ShareDialog 
          open={showShare} 
          onOpenChange={setShowShare} 
          project={activeProject} 
        />
      )}
    </>
  )
}
