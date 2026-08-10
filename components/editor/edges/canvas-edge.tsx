import { useState, useRef, useEffect } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";

export function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const { setEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [localLabel, setLocalLabel] = useState((data?.label as string) || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalLabel((data?.label as string) || "");
  }, [data?.label]);

  const handleLabelChange = (newLabel: string) => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          return { ...edge, data: { ...edge.data, label: newLabel } };
        }
        return edge;
      })
    );
  };

  const onEdgeDoubleClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
          ...style, 
          strokeWidth: 2,
          stroke: selected ? "var(--color-accent-primary)" : isHovered ? "var(--color-text-secondary)" : "var(--color-border-subtle)",
          transition: "stroke 0.2s"
        }} 
      />
      {/* Interaction path for easier hovering/clicking without increasing visual thickness */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        className="react-flow__edge-interaction cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={onEdgeDoubleClick}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onDoubleClick={onEdgeDoubleClick}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              className="bg-bg-elevated border border-border-subtle text-text-primary text-[11px] px-2 py-1 rounded shadow-sm outline-none min-w-[60px]"
              value={localLabel}
              onChange={(e) => setLocalLabel(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                handleLabelChange(localLabel);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  setIsEditing(false);
                  handleLabelChange(localLabel);
                }
              }}
              style={{ width: `${Math.max(60, localLabel.length * 8 + 20)}px` }}
            />
          ) : (
            (data?.label) ? (
              <div className="bg-bg-elevated/90 backdrop-blur-sm border border-border-subtle text-text-secondary text-[11px] font-medium px-2 py-0.5 rounded-full cursor-pointer hover:bg-bg-subtle hover:text-text-primary hover:border-text-muted transition-colors whitespace-nowrap shadow-sm">
                {data.label as string}
              </div>
            ) : (isHovered || selected) ? (
              <div className="w-5 h-5 rounded-full bg-bg-surface border border-border-subtle flex items-center justify-center cursor-pointer text-text-faint hover:text-text-primary hover:border-text-muted hover:bg-bg-elevated shadow-sm transition-colors">
                <span className="text-[11px] font-bold leading-none">+</span>
              </div>
            ) : null
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
