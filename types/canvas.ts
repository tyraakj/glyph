import { Node, Edge } from "@xyflow/react";

/**
 * Data associated with our custom React Flow nodes.
 */
export type CanvasNodeData = {
  label: string;
  color?: string;
  textColor?: string;
  shape?: string;
  // Let Liveblocks store arbitrary properties if needed
  [key: string]: any;
};

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasEdge = Edge;

export const NODE_COLORS = [
  { background: "#1F1F1F", text: "#EDEDED", name: "Neutral" },
  { background: "#10233D", text: "#52A8FF", name: "Blue" },
  { background: "#2E1938", text: "#BF7AF0", name: "Purple" },
  { background: "#331B00", text: "#FF990A", name: "Orange" },
  { background: "#3C1618", text: "#FF6166", name: "Red" },
  { background: "#3A1726", text: "#F75F8F", name: "Pink" },
  { background: "#0F2E18", text: "#62C073", name: "Green" },
  { background: "#062822", text: "#0AC7B4", name: "Teal" },
];
