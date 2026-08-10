"use client";

import { useState } from "react";
import { EditorNavbar } from "./editor-navbar";
import { ProjectSidebar } from "./project-sidebar";
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

  return (
    <ProjectDialogsProvider>
      <div className="flex h-screen w-full bg-bg-base overflow-hidden relative text-text-primary">
        
        {/* Mobile Scrim */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <ProjectSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
        />
        
        <div className="flex flex-col flex-1 h-full min-w-0">
          <EditorNavbar 
            isSidebarOpen={isSidebarOpen} 
            onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
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
