import { Node, Edge } from "@xyflow/react";

/**
 * Data associated with our custom React Flow nodes.
 */
export type CanvasNodeData = {
  label: string;
  color?: string;
  shape?: string;
  // Let Liveblocks store arbitrary properties if needed
  [key: string]: any;
};

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasEdge = Edge;
