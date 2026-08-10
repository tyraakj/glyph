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
        width={data.width || 150} // Fallback sizes if not provided (though handled by style width/height usually)
        height={data.height || 100}
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
