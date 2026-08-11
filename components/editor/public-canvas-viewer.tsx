"use client"

import { ReactFlow, Background, BackgroundVariant, MiniMap, ReactFlowProvider } from "@xyflow/react"
import { CanvasNodeComponent } from "@/components/editor/nodes/canvas-node"
import { CanvasEdgeComponent } from "@/components/editor/edges/canvas-edge"

const nodeTypes = {
  canvasNode: CanvasNodeComponent,
}

const edgeTypes = {
  canvasEdge: CanvasEdgeComponent,
}

export function PublicCanvasViewer({ initialNodes, initialEdges }: { initialNodes: any[], initialEdges: any[] }) {
  // Convert standard React Flow nodes/edges back to the custom types if they lack them
  const formattedNodes = initialNodes.map(node => ({
    ...node,
    type: 'canvasNode'
  }))
  
  const formattedEdges = initialEdges.map(edge => ({
    ...edge,
    type: 'canvasEdge'
  }))

  return (
    <ReactFlowProvider>
      <div className="w-full h-full">
        <ReactFlow
          nodes={formattedNodes}
          edges={formattedEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          fitView
          minZoom={0.1}
          maxZoom={2}
          className="bg-bg-base"
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={2} 
            color="var(--color-border-subtle)" 
          />
          <MiniMap 
            className="!bg-bg-surface !border-border-subtle rounded-lg overflow-hidden shadow-lg"
            maskColor="rgba(0,0,0,0.5)"
            nodeColor="var(--color-brand)"
          />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  )
}
