"use client";

import { createContext, useContext, useState, ReactNode } from "react";

import type { Project } from "@/generated/prisma";

export type DialogType = "create" | "rename" | "delete" | null;

interface ProjectDialogsContextType {
  activeDialog: DialogType;
  activeProject: Project | null;
  openDialog: (type: DialogType, project?: Project) => void;
  closeDialog: () => void;
}

const ProjectDialogsContext = createContext<ProjectDialogsContextType | undefined>(undefined);

export function ProjectDialogsProvider({ children }: { children: ReactNode }) {
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const openDialog = (type: DialogType, project?: Project) => {
    setActiveDialog(type);
    if (project) {
      setActiveProject(project);
    } else if (type === "create") {
      setActiveProject(null);
    }
  };

  const closeDialog = () => {
    setActiveDialog(null);
    // intentional slight delay to prevent flicker before dialog closes
    setTimeout(() => setActiveProject(null), 300);
  };

  return (
    <ProjectDialogsContext.Provider value={{ activeDialog, activeProject, openDialog, closeDialog }}>
      {children}
    </ProjectDialogsContext.Provider>
  );
}

export function useProjectDialogs() {
  const context = useContext(ProjectDialogsContext);
  if (context === undefined) {
    throw new Error("useProjectDialogs must be used within a ProjectDialogsProvider");
  }
  return context;
}
