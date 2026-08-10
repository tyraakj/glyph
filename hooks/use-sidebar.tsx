"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface SidebarContextValue {
  isSidebarOpen: boolean;
  isAiSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  openAiSidebar: () => void;
  closeAiSidebar: () => void;
  toggleAiSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAiSidebarOpen, setAiSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(p => !p), []);

  const openAiSidebar = useCallback(() => setAiSidebarOpen(true), []);
  const closeAiSidebar = useCallback(() => setAiSidebarOpen(false), []);
  const toggleAiSidebar = useCallback(() => setAiSidebarOpen(p => !p), []);

  return (
    <SidebarContext.Provider value={{
      isSidebarOpen,
      isAiSidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      openAiSidebar,
      closeAiSidebar,
      toggleAiSidebar,
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}
