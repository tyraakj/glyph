import { useReactFlow } from "@xyflow/react";
import { ZoomIn, ZoomOut, Maximize, Undo2, Redo2 } from "lucide-react";
import { useUndo, useRedo, useCanUndo, useCanRedo } from "@liveblocks/react/suspense";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({ undo, redo, canUndo, canRedo });

  return (
    <div className="flex items-center gap-1 bg-bg-elevated/95 backdrop-blur-md border border-border-subtle p-1.5 rounded-2xl shadow-xl pointer-events-auto">
      <button
        onClick={() => zoomOut({ duration: 200 })}
        className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
        title="Zoom Out (-)"
      >
        <ZoomOut className="w-5 h-5" />
      </button>
      <button
        onClick={() => fitView({ duration: 200 })}
        className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
        title="Fit View"
      >
        <Maximize className="w-5 h-5" />
      </button>
      <button
        onClick={() => zoomIn({ duration: 200 })}
        className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
        title="Zoom In (+)"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      
      <div className="w-[1px] h-5 bg-border-subtle mx-1" />
      
      <button
        onClick={undo}
        disabled={!canUndo}
        className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
        title="Undo (Cmd/Ctrl + Z)"
      >
        <Undo2 className="w-5 h-5" />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
        title="Redo (Cmd/Ctrl + Shift + Z)"
      >
        <Redo2 className="w-5 h-5" />
      </button>
    </div>
  );
}
