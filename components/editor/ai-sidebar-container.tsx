"use client";

import { useSidebar } from "@/hooks/use-sidebar";
import { AiSidebar } from "./ai-sidebar";

export function AiSidebarContainer() {
  const { isAiSidebarOpen, closeAiSidebar } = useSidebar();
  
  return (
    <AiSidebar 
      isOpen={isAiSidebarOpen}
      onClose={closeAiSidebar}
    />
  );
}
