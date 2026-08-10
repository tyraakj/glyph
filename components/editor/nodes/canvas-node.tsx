"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";
import { ShapeRenderer } from "../shape-renderers";

export const CanvasNodeComponent = memo(({ id, data, selected }: NodeProps<CanvasNode>) => {
  const { updateNodeData } = useReactFlow();

  const handleLabelChange = (newLabel: string) => {
    updateNodeData(id, { label: newLabel });
  };

  return (
    <>
      <NodeResizer 
        color="var(--color-accent-primary)" 
        isVisible={selected} 
        minWidth={50} 
        minHeight={50}
        handleClassName="w-2.5 h-2.5 !bg-bg-elevated !border-2 !border-accent-primary !rounded-sm"
        lineClassName="!border-accent-primary"
      />
      
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary border-none" />
      
      <ShapeRenderer
        shape={data.shape || "rectangle"}
        width="100%"
        height="100%"
        color={data.color}
        label={data.label}
        selected={selected}
        onLabelChange={handleLabelChange}
      />

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary border-none" />
      <Handle type="source" position={Position.Left} className="w-2 h-2 !bg-primary border-none" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary border-none" />
    </>
  );
});

CanvasNodeComponent.displayName = "CanvasNodeComponent";
