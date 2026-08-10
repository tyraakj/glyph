"use client";

import { useCallback, useRef } from "react";
import { ReactFlow, Background, MiniMap, BackgroundVariant, ConnectionMode, ReactFlowProvider, useReactFlow, Panel, MarkerType } from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { CanvasNodeComponent } from "./nodes/canvas-node";
import { CanvasEdgeComponent } from "./edges/canvas-edge";
import { ShapePanel, type DragPayload } from "./shape-panel";

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
  const { screenToFlowPosition } = useReactFlow();

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

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex-1 w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
        <Panel position="bottom-center" className="mb-6">
          <ShapePanel />
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
