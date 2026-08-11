"use client";

import { useCallback, useRef, useEffect, useMemo, useState } from "react";
import { ReactFlow, Background, MiniMap, BackgroundVariant, ConnectionMode, ReactFlowProvider, useReactFlow, Panel, MarkerType, useStore } from "@xyflow/react";
import type { CanvasTemplate } from "./starter-templates";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import { useUpdateMyPresence, useEventListener } from "@liveblocks/react/suspense";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { CanvasNodeComponent } from "./nodes/canvas-node";
import { CanvasEdgeComponent } from "./edges/canvas-edge";
import { ShapePanel, type DragPayload } from "./shape-panel";
import { CanvasControls } from "./canvas-controls";
import { ParticipantGroup } from "./participant-group";
import { AiChatFeedPayloadSchema } from "@/types/tasks";
import { cn } from "@/lib/utils";

import { useParams } from "next/navigation";
import { useAutosave } from "@/hooks/use-autosave";

import "@xyflow/react/dist/style.css";

const nodeTypes = {
  canvasNode: CanvasNodeComponent,
};

const edgeTypes = {
  canvasEdge: CanvasEdgeComponent,
};

function AiCursor({ position, status }: { position: { x: number; y: number } | null; status: "idle" | "thinking" | "typing" }) {
  const transform = useStore((s) => s.transform);
  
  if (status === "idle" && !position) return null;
  
  let x = 0;
  let y = 0;
  
  if (position) {
    x = position.x * transform[2] + transform[0];
    y = position.y * transform[2] + transform[1];
  } else if (status === "thinking" && typeof window !== "undefined") {
    x = window.innerWidth / 2 - 150;
    y = window.innerHeight / 2;
  }

  return (
    <div
      className={cn(
        "absolute top-0 left-0 pointer-events-none z-[100] transition-all duration-300 ease-out",
        status === "thinking" && "animate-pulse"
      )}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 1L12 21L15 13L23 10L4 1Z" fill="#00D2FF" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className="absolute top-5 left-5 px-2 py-0.5 rounded-md bg-[#00D2FF] text-white text-[10px] font-semibold whitespace-nowrap shadow-sm flex items-center gap-1">
        Glyph AI
        {status === "thinking" && <span className="opacity-80 ml-0.5">(Thinking...)</span>}
      </div>
    </div>
  );
}

function CanvasBoardInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
    isLoading
  } = useLiveblocksFlow<CanvasNode, CanvasEdge>();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView, updateNodeData } = useReactFlow();
  const [aiCursor, setAiCursor] = useState<{x: number, y: number} | null>(null);
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "typing">("idle");
  
  const params = useParams();
  const roomId = typeof params?.roomId === 'string' ? params.roomId : '';
  const projectId = useMemo(() => {
    const idMatch = roomId.match(/^([^-]+)-/);
    return idMatch ? idMatch[1] : roomId;
  }, [roomId]);

  const { status: saveStatus, saveCanvas } = useAutosave(projectId, nodes, edges);
  
  // Track if we've attempted to load to prevent infinite loops
  const hasAttemptedLoad = useRef(false);

  // Version History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<any | null>(null);

  const handleRestoreVersion = async (versionId: string) => {
    if (!projectId) return;
    
    const res = await fetch(`/api/projects/${projectId}/versions/${versionId}/restore`, {
      method: "POST"
    });
    
    if (!res.ok) {
      throw new Error("Failed to restore version");
    }
    
    const data = await res.json();
    if (data.canvas) {
      // 1. Clear existing nodes and edges
      onNodesChange((nodes || []).map(n => ({ type: "remove", id: n.id })));
      onEdgesChange((edges || []).map(e => ({ type: "remove", id: e.id })));

      // 2. Add restored nodes and edges
      onNodesChange(data.canvas.nodes.map((n: any) => ({ type: "add", item: n })));
      onEdgesChange(data.canvas.edges.map((e: any) => ({ type: "add", item: e })));

      // 3. Close preview and history
      setPreviewVersion(null);
      setIsHistoryOpen(false);
      
      // 4. Fit view
      setTimeout(() => fitView({ duration: 500, padding: 0.2 }), 50);
    }
  };

  useEffect(() => {
    if (isLoading || hasAttemptedLoad.current || !projectId) return;
    
    // Only load if the room is completely empty
    if ((!nodes || nodes.length === 0) && (!edges || edges.length === 0)) {
      hasAttemptedLoad.current = true;
      
      const loadSavedCanvas = async () => {
        try {
          const res = await fetch(`/api/projects/${projectId}/canvas`);
          if (res.ok) {
            const data = await res.json();
            if (data.nodes && data.nodes.length > 0) {
              onNodesChange(data.nodes.map((n: CanvasNode) => ({ type: "add", item: n })));
            }
            if (data.edges && data.edges.length > 0) {
              onEdgesChange(data.edges.map((e: CanvasEdge) => ({ type: "add", item: e })));
            }
            setTimeout(() => fitView({ duration: 500, padding: 0.2 }), 100);
          }
        } catch (error) {
          console.error("Failed to load saved canvas", error);
        }
      };
      
      loadSavedCanvas();
    } else {
      // Room already has data, no need to load
      hasAttemptedLoad.current = true;
    }
  }, [isLoading, nodes, edges, projectId, onNodesChange, onEdgesChange, fitView]);

  useEffect(() => {
    const handleImport = (e: Event) => {
      const customEvent = e as CustomEvent<CanvasTemplate>;
      const template = customEvent.detail;
      if (!template) return;

      // 1. Clear existing nodes and edges
      onNodesChange((nodes || []).map(n => ({ type: "remove", id: n.id })));
      onEdgesChange((edges || []).map(e => ({ type: "remove", id: e.id })));

      // 2. Add new nodes and edges
      onNodesChange(template.nodes.map(n => ({ type: "add", item: n })));
      onEdgesChange(template.edges.map(e => ({ type: "add", item: e })));

      // 3. Fit view after slight delay to allow rendering
      setTimeout(() => fitView({ duration: 500, padding: 0.2 }), 50);

      // 4. Manually trigger save with template-import source
      saveCanvas(template.nodes as CanvasNode[], template.edges as CanvasEdge[], "template-import", `Imported ${template.name} template`);
    };

    window.addEventListener("import-starter-template", handleImport);
    return () => window.removeEventListener("import-starter-template", handleImport);
  }, [nodes, edges, onNodesChange, onEdgesChange, fitView, saveCanvas]);

  // Listen for AI chat to manage thinking state
  useEventListener(({ event }) => {
    if (event.type === "ai-chat") {
      const parsed = AiChatFeedPayloadSchema.safeParse(event);
      if (parsed.success) {
        if (parsed.data.role === "user") {
          setAiStatus("thinking");
        } else if (parsed.data.role === "assistant" || parsed.data.role === "system") {
          setAiStatus("idle");
        }
      }
    }
  });

  // Listen for AI-generated design operations from the Python worker
  useEventListener(({ event }) => {
    // Liveblocks REST API broadcasts wrap the payload under .data;
    // client-side broadcast() delivers the payload directly.
    const payload = (event as any).data ?? event;
    if (payload?.type !== "ai-design-update") return;

    const operations = payload.operations as any[];
    if (!Array.isArray(operations) || operations.length === 0) return;

    const newNodes: CanvasNode[] = [];
    const newEdges: CanvasEdge[] = [];
    const deleteIds: string[] = [];

    // Pass 1: Process Nodes and Deletions
    for (const op of operations) {
      if (op.type === "DeleteObject") {
        deleteIds.push(op.id);
        continue;
      }
      if (op.type !== "UpdateObject") continue;

      const d = op.data;
      if (d?.position) {
        const fullLabel = d.data?.label || op.id;
        
        // Dynamically calculate required node size based on text length
        let width = 160;
        let height = 60;
        if (fullLabel && fullLabel.length > 18) {
          width = fullLabel.length > 30 ? 240 : 200;
          const charsPerLine = Math.floor((width - 30) / 7.5);
          const lines = Math.ceil(fullLabel.length / charsPerLine);
          height = Math.max(60, lines * 22 + 40);
        }

        newNodes.push({
          id: op.id,
          type: "canvasNode",
          position: d.position,
          data: {
            label: fullLabel,
            shape: d.data?.shape || "rectangle",
            color: d.data?.color || d.data?.backgroundColor,
            textColor: d.data?.textColor,
          },
          style: { width, height },
        } as CanvasNode);
      }
    }

    // Pass 2: Process Edges (now we know all node positions)
    const allNodes = [...nodes, ...newNodes];
    for (const op of operations) {
      if (op.type !== "UpdateObject") continue;

      const d = op.data;
      if (d?.source && d?.target) {
        const sourceNode = allNodes.find(n => n.id === d.source);
        const targetNode = allNodes.find(n => n.id === d.target);
        
        let sourceHandle = "bottom-source";
        let targetHandle = "top-target";
        
        if (sourceNode && targetNode) {
          const dx = targetNode.position.x - sourceNode.position.x;
          const dy = targetNode.position.y - sourceNode.position.y;
          
          if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal connection
            if (dx > 0) {
              sourceHandle = "right-source";
              targetHandle = "left-target";
            } else {
              sourceHandle = "left-source";
              targetHandle = "right-target";
            }
          } else {
            // Vertical connection
            if (dy > 0) {
              sourceHandle = "bottom-source";
              targetHandle = "top-target";
            } else {
              sourceHandle = "top-source";
              targetHandle = "bottom-target";
            }
          }
        }
        
        newEdges.push({
          id: op.id,
          source: d.source,
          target: d.target,
          type: "canvasEdge",
          label: d.label || "",
          sourceHandle,
          targetHandle,
        } as CanvasEdge);
      }
    }

    // Run an async animation loop for live-drawing and typing effects
    const animateCreation = async () => {
      setAiStatus("typing");
      const MOVE_DELAY = 150;
      const TYPE_SPEED = 20;
      
      // 0. Perform Deletions first
      for (const id of deleteIds) {
        const targetNode = nodes.find(n => n.id === id);
        if (targetNode) {
          setAiCursor({ x: targetNode.position.x + 80, y: targetNode.position.y + 30 });
          await new Promise(r => setTimeout(r, MOVE_DELAY));
        }
        onNodesChange([{ type: "remove", id }]);
        onEdgesChange([{ type: "remove", id }]);
      }
      
      for (const node of newNodes) {
        // 1. Move AI cursor to position
        setAiCursor({ x: node.position.x + 80, y: node.position.y + 30 });
        await new Promise(r => setTimeout(r, MOVE_DELAY));
        
        // 2. Add the node with an empty label
        const fullLabel = (node.data.label as string) || "";
        const emptyNode = { ...node, data: { ...node.data, label: "" } };
        onNodesChange([{ type: "add" as const, item: emptyNode }]);
        
        // 3. Type out the label character by character
        let currentLabel = "";
        for (const char of fullLabel) {
          currentLabel += char;
          updateNodeData(node.id, { label: currentLabel });
          await new Promise(r => setTimeout(r, TYPE_SPEED));
        }
      }
      
      // 4. Place edges slightly faster
      for (const edge of newEdges) {
        const targetNode = newNodes.find(n => n.id === edge.target);
        if (targetNode) {
          setAiCursor({ x: targetNode.position.x + 80, y: targetNode.position.y + 30 });
        }
        await new Promise(r => setTimeout(r, 100));
        onEdgesChange([{ type: "add" as const, item: edge }]);
      }
      
      // 5. Clean up and zoom to fit
      setTimeout(() => {
        setAiCursor(null);
        setAiStatus("idle");
        fitView({ duration: 700, padding: 0.2 });

        const finalNodes = [...nodes.filter(n => !deleteIds.includes(n.id)), ...newNodes];
        const finalEdges = [...edges.filter(e => !deleteIds.includes(e.id)), ...newEdges];
        saveCanvas(finalNodes, finalEdges, "ai-generation", "AI Generated Design");
      }, 300);
    };

    animateCreation();
  });

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const payloadStr = event.dataTransfer.getData("application/json");
      if (!payloadStr) return;

      const payload = JSON.parse(payloadStr) as DragPayload;

      // Convert screen coordinates to React Flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: CanvasNode = {
        id: `${payload.shape}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: "canvasNode",
        position,
        data: {
          label: "",
          shape: payload.shape,
        },
        style: {
          width: payload.width,
          height: payload.height,
        },
      };

      // Add the node to Liveblocks via the standard flow change handler
      onNodesChange([{ type: "add", item: newNode }]);
    },
    [screenToFlowPosition, onNodesChange]
  );

  const updateMyPresence = useUpdateMyPresence();

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      updateMyPresence({ cursor: position });
    },
    [screenToFlowPosition, updateMyPresence]
  );

  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  const mappedEdges = useMemo(() => {
    return edges?.map(e => ({
      ...e,
      sourceHandle: e.sourceHandle ? (e.sourceHandle.includes('-source') ? e.sourceHandle : `${e.sourceHandle}-source`) : undefined,
      targetHandle: e.targetHandle ? (e.targetHandle.includes('-target') ? e.targetHandle : `${e.targetHandle}-target`) : undefined,
    })) || [];
  }, [edges]);

  if (isLoading) {
    return null;
  }

  return (
    <div 
      className="flex-1 w-full h-full relative" 
      ref={reactFlowWrapper}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <ReactFlow
        nodes={nodes || []}
        edges={mappedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ 
          type: 'canvasEdge', 
          markerEnd: { 
            type: MarkerType.ArrowClosed, 
            width: 20, 
            height: 20, 
            color: 'var(--color-border-subtle)' 
          } 
        }}
        fitView
        className="bg-bg-base"
        connectionMode={ConnectionMode.Loose}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="var(--color-border-subtle)" />
        <MiniMap 
          nodeColor="var(--color-primary)" 
          maskColor="var(--color-bg-base-alpha-80)" 
          className="bg-bg-surface border-border-default rounded-lg shadow-sm"
        />
        <Cursors />
        <AiCursor position={aiCursor} status={aiStatus} />
        <Panel position="top-right" className="mt-4 mr-4 pointer-events-none">
          <ParticipantGroup />
        </Panel>
        <Panel position="bottom-center" className="mb-6">
          <ShapePanel />
        </Panel>
        <Panel position="bottom-left" className="ml-4 mb-6">
          <CanvasControls 
            saveStatus={saveStatus} 
            onHistoryClick={() => setIsHistoryOpen(true)}
          />
        </Panel>
      </ReactFlow>

      {isHistoryOpen && (
        <VersionHistoryPanel 
          projectId={projectId}
          onClose={() => setIsHistoryOpen(false)}
          onSelectVersion={setPreviewVersion}
        />
      )}

      {previewVersion && (
        <VersionPreviewCanvas
          version={previewVersion}
          currentNodes={nodes}
          currentEdges={edges}
          onClose={() => setPreviewVersion(null)}
          onRestore={handleRestoreVersion}
        />
      )}
    </div>
  );
}

import { VersionHistoryPanel } from "./version-history/version-history-panel";
import { VersionPreviewCanvas } from "./version-history/version-preview-canvas";

export function CanvasBoard() {
  return <CanvasBoardInner />;
}
