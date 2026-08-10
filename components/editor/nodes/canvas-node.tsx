"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";
import { ShapeRenderer } from "../shape-renderers";

export const CanvasNodeComponent = memo(({ data, selected }: NodeProps<CanvasNode>) => {
  return (
    <>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary border-none" />
      
      <ShapeRenderer
        shape={data.shape || "rectangle"}
        width="100%"
        height="100%"
        color={data.color}
        label={data.label}
        selected={selected}
      />

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary border-none" />
      <Handle type="source" position={Position.Left} className="w-2 h-2 !bg-primary border-none" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary border-none" />
    </>
  );
});

CanvasNodeComponent.displayName = "CanvasNodeComponent";
