"use client";

import { Square, Diamond, Circle, Cylinder, Hexagon, Component } from "lucide-react";
import { ShapeRenderer } from "./shape-renderers";

export interface DragPayload {
  shape: string;
  width: number;
  height: number;
}

const SHAPES = [
  { id: "rectangle", icon: Square, width: 150, height: 100 },
  { id: "diamond", icon: Diamond, width: 120, height: 120 },
  { id: "circle", icon: Circle, width: 100, height: 100 },
  { id: "pill", icon: Component, width: 160, height: 80 },
  { id: "cylinder", icon: Cylinder, width: 100, height: 120 },
  { id: "hexagon", icon: Hexagon, width: 120, height: 110 },
];

export function ShapePanel() {
  const onDragStart = (event: React.DragEvent, shapeInfo: typeof SHAPES[0]) => {
    const payload: DragPayload = {
      shape: shapeInfo.id,
      width: shapeInfo.width,
      height: shapeInfo.height,
    };
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";

    // Set custom drag image ghost
    const dragPreview = document.getElementById(`drag-preview-${shapeInfo.id}`);
    if (dragPreview) {
      // Center the drag preview on the cursor
      event.dataTransfer.setDragImage(dragPreview, shapeInfo.width / 2, shapeInfo.height / 2);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 rounded-full bg-bg-elevated/80 backdrop-blur-md border border-border-default shadow-lg">
        {SHAPES.map((shape) => {
          const Icon = shape.icon;
          return (
            <div
              key={shape.id}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-surface-hover cursor-grab active:cursor-grabbing text-text-secondary hover:text-text-primary transition-colors"
              draggable
              onDragStart={(e) => onDragStart(e, shape)}
              title={`Add ${shape.id}`}
            >
              <Icon className="w-5 h-5" />
            </div>
          );
        })}
      </div>

      {/* Visually hidden container for drag previews */}
      <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none opacity-0">
        {SHAPES.map((shape) => (
          <div key={`preview-${shape.id}`} id={`drag-preview-${shape.id}`}>
            <ShapeRenderer shape={shape.id} width={shape.width} height={shape.height} />
          </div>
        ))}
      </div>
    </>
  );
}
