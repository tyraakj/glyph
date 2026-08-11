import { useState, useEffect, useRef, useCallback } from "react";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave(projectId: string | undefined, nodes: CanvasNode[] | undefined | null, edges: CanvasEdge[] | undefined | null) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if this is the initial render to avoid saving immediately on load
  const isInitialRender = useRef(true);
  
  const saveCanvas = useCallback(async (currentNodes: CanvasNode[], currentEdges: CanvasEdge[], source = "autosave", label?: string) => {
    if (!projectId) return;

    try {
      setStatus("saving");
      
      const res = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: currentNodes, edges: currentEdges, source, label }),
      });

      if (!res.ok) {
        throw new Error("Failed to save canvas");
      }

      setStatus("saved");
    } catch (error) {
      console.error("Autosave failed:", error);
      setStatus("error");
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId || !nodes || !edges) return;

    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setStatus("idle");
    
    saveTimeoutRef.current = setTimeout(() => {
      saveCanvas(nodes, edges, "autosave");
    }, 2000); // 2 second debounce

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [nodes, edges, projectId, saveCanvas]);

  return { status, saveCanvas };
}
