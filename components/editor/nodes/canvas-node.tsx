"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, NodeResizer, useReactFlow, NodeToolbar } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";
import { ShapeRenderer } from "../shape-renderers";

export const CanvasNodeComponent = memo(({ id, data, selected }: NodeProps<CanvasNode>) => {
  const { updateNodeData } = useReactFlow();

  const handleLabelChange = (newLabel: string) => {
    updateNodeData(id, { label: newLabel });
  };

  return (
    <div className="group w-full h-full relative">
      <NodeToolbar isVisible={selected} position={Position.Top} className="nodrag nopan mb-2">
        <div className="flex items-center gap-2 bg-bg-elevated/95 backdrop-blur-md border border-border-subtle p-2 rounded-2xl shadow-xl">
          {NODE_COLORS.map(colorPair => {
            const isActive = data.color === colorPair.background;
            return (
              <button
                key={colorPair.background}
                type="button"
                className={`w-8 h-8 rounded-full transition-all duration-200 border-2 ${
                  isActive ? "border-text-primary scale-110" : "border-transparent hover:scale-105"
                }`}
                style={{
                  backgroundColor: colorPair.text,
                  boxShadow: isActive ? `0 0 12px ${colorPair.text}60` : "none"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.boxShadow = `0 0 8px ${colorPair.text}60`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
                onClick={() => {
                  updateNodeData(id, {
                    color: colorPair.background,
                    textColor: colorPair.text,
                  });
                }}
                title={colorPair.name}
              />
            );
          })}
        </div>
      </NodeToolbar>

      <NodeResizer 
        color="var(--color-accent-primary)" 
        isVisible={selected} 
        minWidth={50} 
        minHeight={50}
        handleClassName="w-2.5 h-2.5 !bg-bg-elevated !border-2 !border-accent-primary !rounded-sm"
        lineClassName="!border-accent-primary"
      />
      
      {data.diffStatus && (
        <div className={`absolute -inset-1.5 rounded-lg z-[-1] ${
          data.diffStatus === 'added' ? 'bg-emerald-500/20 border-2 border-emerald-500/80 animate-pulse' :
          data.diffStatus === 'removed' ? 'bg-red-500/20 border-2 border-red-500/80' :
          data.diffStatus === 'modified' ? 'bg-amber-500/20 border-2 border-amber-500/80 animate-pulse' :
          ''
        }`} />
      )}
      
      {/* Top Handles */}
      <Handle id="top-target" type="target" position={Position.Top} className="w-2.5 h-2.5 !bg-text-primary !border-2 !border-bg-surface opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle id="top-source" type="source" position={Position.Top} className="w-2.5 h-2.5 !bg-text-primary !border-2 !border-bg-surface opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <ShapeRenderer
        shape={data.shape || "rectangle"}
        width="100%"
        height="100%"
        color={data.color}
        textColor={data.textColor}
        label={data.label}
        selected={selected}
        onLabelChange={handleLabelChange}
      />

      {/* Bottom Handles */}
      <Handle id="bottom-target" type="target" position={Position.Bottom} className="w-2.5 h-2.5 !bg-text-primary !border-2 !border-bg-surface opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle id="bottom-source" type="source" position={Position.Bottom} className="w-2.5 h-2.5 !bg-text-primary !border-2 !border-bg-surface opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Left Handles */}
      <Handle id="left-target" type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-text-primary !border-2 !border-bg-surface opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle id="left-source" type="source" position={Position.Left} className="w-2.5 h-2.5 !bg-text-primary !border-2 !border-bg-surface opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Right Handles */}
      <Handle id="right-target" type="target" position={Position.Right} className="w-2.5 h-2.5 !bg-text-primary !border-2 !border-bg-surface opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle id="right-source" type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-text-primary !border-2 !border-bg-surface opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
});

CanvasNodeComponent.displayName = "CanvasNodeComponent";
