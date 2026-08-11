"use client";

import { useParams } from "next/navigation";
import { EditorNavbar } from "./editor-navbar";
import { ProjectSidebar } from "./project-sidebar";
import { ProjectDialogsProvider } from "@/hooks/use-project-dialogs";
import { ProjectDialogs } from "./project-dialogs";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";
import type { Project } from "@/generated/prisma";

interface EditorShellProps {
  children: React.ReactNode;
  ownedProjects?: Project[];
  sharedProjects?: Project[];
}

function EditorShellInner({ children, ownedProjects = [], sharedProjects = [] }: EditorShellProps) {
  const { isSidebarOpen, closeSidebar, toggleSidebar, isAiSidebarOpen, closeAiSidebar, toggleAiSidebar } = useSidebar();
  const params = useParams();
  
  const roomId = typeof params?.roomId === 'string' ? params.roomId : undefined;
  const activeProject = roomId 
    ? [...ownedProjects, ...sharedProjects].find(p => roomId.startsWith(p.id)) 
    : undefined;

  return (
    <ProjectDialogsProvider>
      <div className="flex h-screen w-full bg-bg-base overflow-hidden text-text-primary">
        
        {/* Left Sidebar */}
        <ProjectSidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar} 
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          activeProjectId={activeProject?.id}
        />
        
        {/* Center: Navbar + Canvas */}
        <div className="flex flex-col flex-1 h-full min-w-0">
          <EditorNavbar 
            isSidebarOpen={isSidebarOpen} 
            onToggleSidebar={toggleSidebar} 
            activeProject={activeProject}
            isAiSidebarOpen={isAiSidebarOpen}
            onToggleAiSidebar={toggleAiSidebar}
          />
          <main className="flex-1 relative overflow-hidden bg-bg-surface">
            {children}
          </main>
        </div>

      </div>
      
      <ProjectDialogs />
    </ProjectDialogsProvider>
  );
}

export function EditorShell(props: EditorShellProps) {
  return (
    <SidebarProvider>
      <EditorShellInner {...props} />
    </SidebarProvider>
  );
}
