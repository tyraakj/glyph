"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { EditorNavbar } from "./editor-navbar";
import { ProjectSidebar } from "./project-sidebar";
import { AiSidebar } from "./ai-sidebar";
import { ProjectDialogsProvider } from "@/hooks/use-project-dialogs";
import { ProjectDialogs } from "./project-dialogs";
import type { Project } from "@/generated/prisma";

export function EditorShell({ 
  children,
  ownedProjects = [],
  sharedProjects = []
}: { 
  children: React.ReactNode;
  ownedProjects?: Project[];
  sharedProjects?: Project[];
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAiSidebarOpen, setAiSidebarOpen] = useState(false);
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
          onClose={() => setSidebarOpen(false)} 
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          activeProjectId={activeProject?.id}
        />
        
        {/* Center: Navbar + Canvas */}
        <div className="flex flex-col flex-1 h-full min-w-0">
          <EditorNavbar 
            isSidebarOpen={isSidebarOpen} 
            onToggleSidebar={() => setSidebarOpen(prev => !prev)} 
            activeProject={activeProject}
            isAiSidebarOpen={isAiSidebarOpen}
            onToggleAiSidebar={() => setAiSidebarOpen(prev => !prev)}
          />
          <main className="flex-1 relative overflow-hidden bg-bg-surface">
            {children}
          </main>
        </div>

        {/* Right Sidebar */}
        <AiSidebar 
          isOpen={isAiSidebarOpen}
          onClose={() => setAiSidebarOpen(false)}
        />
      </div>
      
      <ProjectDialogs />
    </ProjectDialogsProvider>
  );
}
