"use client";

import { useState, useEffect } from "react";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import { useProjectActions } from "@/hooks/use-project-actions";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function ProjectDialogs() {
  const { activeDialog, activeProject, closeDialog } = useProjectDialogs();
  const { createProject, renameProject, deleteProject, isSubmitting, error, setError } = useProjectActions();
  
  const [name, setName] = useState("");

  useEffect(() => {
    if (activeDialog === "rename" && activeProject) {
      setName(activeProject.name);
    } else {
      setName("");
    }
    setError(null);
  }, [activeDialog, activeProject, setError]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const success = await createProject(name);
    if (success) closeDialog();
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeProject) return;
    const success = await renameProject(activeProject.id, name);
    if (success) closeDialog();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    // We can assume isActiveWorkspace is false for now since workspace isn't fully built yet
    const success = await deleteProject(activeProject.id, false);
    if (success) closeDialog();
  };

  return (
    <>
      <Dialog isOpen={activeDialog === "create"} onClose={closeDialog}>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Create a new workspace for your architecture design.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-primary">Project Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:border-text-primary"
              placeholder="e.g. Core Services API"
              required
              autoFocus
            />
            {name && (
              <p className="text-xs text-text-muted mt-1">
                Room ID: <span className="text-text-primary font-mono">{"[id]-" + generateSlug(name)}</span>
              </p>
            )}
            {error && <p className="text-sm text-state-error mt-1">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={closeDialog} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Dialog isOpen={activeDialog === "rename"} onClose={closeDialog}>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Rename <span className="font-medium text-text-primary">{activeProject?.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleRename} className="mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-primary">New Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:border-text-primary"
              required
              autoFocus
            />
            {error && <p className="text-sm text-state-error mt-1">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={closeDialog} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !name.trim() || name === activeProject?.name}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Dialog isOpen={activeDialog === "delete"} onClose={closeDialog}>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-medium text-text-primary">{activeProject?.name}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col gap-3">
          {error && <p className="text-sm text-state-error">{error}</p>}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="ghost" onClick={closeDialog} disabled={isSubmitting}>Cancel</Button>
            <Button 
              onClick={handleDelete} 
              disabled={isSubmitting}
              className="bg-state-error text-white hover:opacity-90 border-none"
            >
              {isSubmitting ? "Deleting..." : "Delete Project"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
