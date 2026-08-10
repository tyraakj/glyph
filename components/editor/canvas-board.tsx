"use client";

import { ReactFlow, Background, MiniMap, BackgroundVariant, ConnectionMode } from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

import "@xyflow/react/dist/style.css";

export function CanvasBoard() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
    isLoading
  } = useLiveblocksFlow<CanvasNode, CanvasEdge>();

  // While Liveblocks initializes the flow state
  if (isLoading) {
    return null;
  }

  return (
    <div className="flex-1 w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        fitView
        className="bg-bg-base"
        connectionMode={ConnectionMode.Loose}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="var(--color-border-subtle)" />
        <MiniMap 
          nodeColor="var(--color-primary)" 
          maskColor="var(--color-bg-base-alpha-80)" 
          className="bg-bg-surface border-border-default rounded-lg shadow-sm"
        />
        <Cursors />
      </ReactFlow>
    </div>
  );
}
