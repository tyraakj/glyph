"use client";

import { useCallback, useRef, useEffect, useMemo } from "react";
import { ReactFlow, Background, MiniMap, BackgroundVariant, ConnectionMode, ReactFlowProvider, useReactFlow, Panel, MarkerType } from "@xyflow/react";
import type { CanvasTemplate } from "./starter-templates";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import { useUpdateMyPresence } from "@liveblocks/react/suspense";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { CanvasNodeComponent } from "./nodes/canvas-node";
import { CanvasEdgeComponent } from "./edges/canvas-edge";
import { ShapePanel, type DragPayload } from "./shape-panel";
import { CanvasControls } from "./canvas-controls";
import { ParticipantGroup } from "./participant-group";

import { useParams } from "next/navigation";
import { useAutosave } from "@/hooks/use-autosave";

import "@xyflow/react/dist/style.css";

const nodeTypes = {
  canvasNode: CanvasNodeComponent,
};

const edgeTypes = {
  canvasEdge: CanvasEdgeComponent,
};

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
  const { screenToFlowPosition, fitView } = useReactFlow();
  
  const params = useParams();
  const roomId = typeof params?.roomId === 'string' ? params.roomId : '';
  const projectId = useMemo(() => {
    const idMatch = roomId.match(/^([^-]+)-/);
    return idMatch ? idMatch[1] : roomId;
  }, [roomId]);

  const saveStatus = useAutosave(projectId, nodes, edges);
  
  // Track if we've attempted to load to prevent infinite loops
  const hasAttemptedLoad = useRef(false);

  useEffect(() => {
    if (isLoading || hasAttemptedLoad.current || !projectId) return;
    
    // Only load if the room is completely empty
    if ((nodes === undefined || nodes.length === 0) && (edges === undefined || edges.length === 0)) {
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
    };

    window.addEventListener("import-starter-template", handleImport);
    return () => window.removeEventListener("import-starter-template", handleImport);
  }, [nodes, edges, onNodesChange, onEdgesChange, fitView]);

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
        <Panel position="top-right" className="mt-4 mr-4 pointer-events-none">
          <ParticipantGroup />
        </Panel>
        <Panel position="bottom-center" className="mb-6">
          <ShapePanel />
        </Panel>
        <Panel position="bottom-left" className="ml-4 mb-6">
          <CanvasControls saveStatus={saveStatus} />
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function CanvasBoard() {
  return (
    <ReactFlowProvider>
      <CanvasBoardInner />
    </ReactFlowProvider>
  );
}
