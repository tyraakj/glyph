"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

export function EditorHome() {
  const { openDialog } = useProjectDialogs();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-semibold text-text-primary mb-2">Create a project or open an existing one</h1>
      <p className="text-text-muted max-w-md mb-8">
        Start a new architecture workspace, or choose a project from the sidebar.
      </p>
      <Button onClick={() => openDialog("create")} className="h-10 px-4">
        <Plus className="w-5 h-5 mr-2" />
        New Project
      </Button>
    </div>
  );
}
