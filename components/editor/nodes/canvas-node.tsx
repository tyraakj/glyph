"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";

export const CanvasNodeComponent = memo(({ data, selected }: NodeProps<CanvasNode>) => {
  return (
    <>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary border-none" />
      
      <div 
        className={`w-full h-full flex items-center justify-center p-2 rounded-md border-2 bg-bg-base shadow-sm transition-colors ${
          selected ? "border-primary" : "border-border-default hover:border-border-hover"
        }`}
        style={{
          backgroundColor: data.color || "var(--color-bg-base)",
        }}
      >
        <span className="text-sm font-medium text-text-primary text-center pointer-events-none select-none">
          {data.label || data.shape}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary border-none" />
      <Handle type="source" position={Position.Left} className="w-2 h-2 !bg-primary border-none" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary border-none" />
    </>
  );
});

CanvasNodeComponent.displayName = "CanvasNodeComponent";
