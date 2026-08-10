import * as React from "react"
import { X, Plus, FolderGit2, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useProjectDialogs, MockProject } from "@/hooks/use-project-dialogs"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const MOCK_OWNED_PROJECTS: MockProject[] = [
  { id: "1", name: "Core Services API", slug: "core-services-api", role: "owner" },
  { id: "2", name: "Frontend Architecture", slug: "frontend-architecture", role: "owner" },
]

const MOCK_SHARED_PROJECTS: MockProject[] = [
  { id: "3", name: "Authentication Flow", slug: "authentication-flow", role: "editor" },
]

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const { openDialog } = useProjectDialogs();

  const renderProjectItem = (project: MockProject) => (
    <div key={project.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-bg-subtle cursor-pointer transition-colors">
      <div className="flex items-center gap-3 overflow-hidden">
        <FolderGit2 className="h-4 w-4 text-text-muted flex-shrink-0" />
        <span className="text-sm font-medium text-text-primary truncate">{project.name}</span>
      </div>
      
      {project.role === "owner" && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); openDialog("rename", project); }}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-md transition-colors"
            title="Rename Project"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); openDialog("delete", project); }}
            className="p-1.5 text-text-muted hover:text-state-error hover:bg-bg-surface rounded-md transition-colors"
            title="Delete Project"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-80 transform bg-bg-elevated/95 backdrop-blur-md shadow-2xl transition-transform duration-300 ease-in-out border-r border-border-subtle flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border-subtle px-4">
        <h2 className="text-sm font-semibold text-text-primary">Projects</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-text-muted hover:text-text-primary"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col p-4">
        <Tabs defaultValue="my-projects" className="flex h-full flex-col">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-projects" className="flex-1 mt-4 overflow-y-auto">
            {MOCK_OWNED_PROJECTS.length > 0 ? (
              <div className="flex flex-col gap-1">
                {MOCK_OWNED_PROJECTS.map(renderProjectItem)}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-3 text-center rounded-xl border border-dashed border-border-subtle p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-surface">
                  <FolderGit2 className="h-6 w-6 text-text-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">No projects yet</p>
                  <p className="text-xs text-text-muted mt-1">Create your first project to get started.</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shared" className="flex-1 mt-4 overflow-y-auto">
            {MOCK_SHARED_PROJECTS.length > 0 ? (
              <div className="flex flex-col gap-1">
                {MOCK_SHARED_PROJECTS.map(renderProjectItem)}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-3 text-center rounded-xl border border-dashed border-border-subtle p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-surface">
                  <FolderGit2 className="h-6 w-6 text-text-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">No shared projects</p>
                  <p className="text-xs text-text-muted mt-1">Projects shared with you will appear here.</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Action */}
      <div className="border-t border-border-subtle p-4 bg-bg-elevated">
        <Button className="w-full justify-center" onClick={() => openDialog("create")}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  )
}
