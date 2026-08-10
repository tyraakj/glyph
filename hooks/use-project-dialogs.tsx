"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type DialogType = "create" | "rename" | "delete" | null;

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "editor" | "viewer";
}

interface ProjectDialogsContextType {
  activeDialog: DialogType;
  activeProject: MockProject | null;
  openDialog: (type: DialogType, project?: MockProject) => void;
  closeDialog: () => void;
}

const ProjectDialogsContext = createContext<ProjectDialogsContextType | undefined>(undefined);

export function ProjectDialogsProvider({ children }: { children: ReactNode }) {
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [activeProject, setActiveProject] = useState<MockProject | null>(null);

  const openDialog = (type: DialogType, project?: MockProject) => {
    window.alert(`openDialog triggered with type: ${type}`);
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
