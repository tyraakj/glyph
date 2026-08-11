import * as React from "react"
import { useEffect } from "react"
import Link from "next/link"
import { X, Plus, FolderGit2, Edit2, Trash2, Search, Archive, ArchiveRestore } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"
import type { Project } from "@/generated/prisma"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  ownedProjects?: Project[]
  sharedProjects?: Project[]
  activeProjectId?: string
}

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function ProjectSidebar({ 
  isOpen, 
  onClose, 
  ownedProjects = [], 
  sharedProjects = [],
  activeProjectId
}: ProjectSidebarProps) {
  const { openDialog } = useProjectDialogs();
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showArchived, setShowArchived] = React.useState(false);

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleArchive = async (projectId: string, isArchived: boolean) => {
    try {
      const endpoint = isArchived ? "unarchive" : "archive";
      await fetch(`/api/projects/${projectId}/${endpoint}`, {
        method: "PATCH",
      });
      // In a real app we'd mutate SWR/React Query here or refresh the page.
      // For now, we'll just reload the page to get fresh data
      window.location.reload();
    } catch (e) {
      console.error("Failed to toggle archive state:", e);
    }
  };

  const filterProjects = (projects: Project[]) => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                            (p.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) || false);
      const isArchived = !!p.archivedAt;
      return matchesSearch && (showArchived ? isArchived : !isArchived);
    });
  };

  const filteredOwned = filterProjects(ownedProjects);
  const filteredShared = filterProjects(sharedProjects);

  const renderProjectItem = (project: Project, isOwner: boolean) => {
    const isActive = project.id === activeProjectId;
    const href = `/editor/${project.id}-${generateSlug(project.name)}`;

    return (
      <Link 
        key={project.id} 
        href={href}
        className={cn(
          "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
          isActive ? "bg-bg-subtle" : "hover:bg-bg-subtle"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <FolderGit2 className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-brand-primary" : "text-text-muted")} />
          <span className={cn("text-sm truncate", isActive ? "font-semibold text-brand-primary" : "font-medium text-text-primary")}>
            {project.name}
          </span>
        </div>
        
        {isOwner && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleArchive(project.id, !!project.archivedAt); }}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-md transition-colors"
            title={project.archivedAt ? "Unarchive Project" : "Archive Project"}
          >
            {project.archivedAt ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
          </button>
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
    </Link>
  )};

  useEffect(() => {
    console.log("[ProjectSidebar] Rendered with isOpen:", isOpen);
  }, [isOpen]);

  return (
    <div
      className={cn(
        "relative shrink-0 min-w-0 z-40 h-full bg-bg-elevated/95 backdrop-blur-md shadow-2xl transition-all duration-300 ease-in-out border-border-subtle overflow-hidden",
        isOpen ? "w-80 border-r opacity-100" : "w-0 border-none opacity-0"
      )}
    >
      {/* Inner wrapper: fixed width so content never squishes */}
      <div className="w-80 h-full flex flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border-subtle px-4">
        <h2 className="text-sm font-semibold text-text-primary">Projects</h2>
        <Button
          variant="ghost"
          size="icon"
          onPointerDown={(e) => { 
            console.log("[ProjectSidebar] Close button onPointerDown fired!");
            e.stopPropagation(); 
            onClose(); 
          }}
          className="h-8 w-8 text-text-muted hover:text-text-primary"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col p-4">
        {/* Search & Filter */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-bg-surface border border-border-subtle rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 px-1">
            <input 
              type="checkbox" 
              id="show-archived" 
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-border-subtle bg-bg-surface text-accent-primary"
            />
            <label htmlFor="show-archived" className="text-xs text-text-secondary cursor-pointer">
              Show Archived
            </label>
          </div>
        </div>

        <Tabs defaultValue="my-projects" className="flex h-full flex-col">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-projects" className="flex-1 mt-4 overflow-y-auto pr-1">
            {filteredOwned.length > 0 ? (
              <div className="flex flex-col gap-1">
                {filteredOwned.map(p => renderProjectItem(p, true))}
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

          <TabsContent value="shared" className="flex-1 mt-4 overflow-y-auto pr-1">
            {filteredShared.length > 0 ? (
              <div className="flex flex-col gap-1">
                {filteredShared.map(p => renderProjectItem(p, false))}
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
      </div>{/* end inner wrapper */}
    </div>
  )
}
