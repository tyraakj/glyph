import { memo } from "react";
import { NodeProps, NodeResizer } from "@xyflow/react";

export type GroupNodeData = {
  label: string;
  color?: string;
  width?: number;
  height?: number;
};

export const GroupNode = memo(({ data, selected }: NodeProps) => {
  return (
    <>
      <NodeResizer 
        color="#00c8d4" 
        isVisible={selected} 
        minWidth={200} 
        minHeight={150} 
      />
      
      <div 
        className="w-full h-full rounded-xl border-2 transition-colors relative"
        style={{ 
          backgroundColor: data.color ? `${data.color}20` : 'rgba(128,128,144,0.1)', 
          borderColor: selected ? '#00c8d4' : (data.color || 'var(--color-border-subtle)') 
        }}
      >
        <div className="absolute top-0 left-0 w-full px-4 py-2 border-b"
             style={{ 
               backgroundColor: data.color ? `${data.color}30` : 'rgba(128,128,144,0.15)',
               borderColor: selected ? '#00c8d4' : (data.color || 'var(--color-border-subtle)')
             }}
        >
          <span className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            {data.label || "Group"}
          </span>
        </div>
      </div>
    </>
  );
});

GroupNode.displayName = "GroupNode";
