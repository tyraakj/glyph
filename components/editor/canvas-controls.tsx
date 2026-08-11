import { useReactFlow } from "@xyflow/react";
import { ZoomIn, ZoomOut, Maximize, Undo2, Redo2, Cloud, CloudOff, Loader2, CloudAlert, History } from "lucide-react";
import { useUndo, useRedo, useCanUndo, useCanRedo } from "@liveblocks/react/suspense";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { SaveStatus } from "@/hooks/use-autosave";

export function CanvasControls({ 
  saveStatus = "idle",
  onHistoryClick
}: { 
  saveStatus?: SaveStatus;
  onHistoryClick?: () => void;
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({ undo, redo, canUndo, canRedo });

  return (
    <div className="flex items-center gap-1 bg-bg-elevated/95 backdrop-blur-md border border-border-subtle p-1.5 rounded-2xl shadow-xl pointer-events-auto">
      {/* Save Status Indicator */}
      <div 
        className="flex items-center justify-center w-8 h-8 mr-1 text-text-muted"
        title={saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved to cloud" : saveStatus === "error" ? "Failed to save" : "All changes saved"}
      >
        {saveStatus === "saving" && <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />}
        {saveStatus === "saved" && <Cloud className="w-4 h-4 text-emerald-500" />}
        {saveStatus === "error" && <CloudAlert className="w-4 h-4 text-red-500" />}
        {saveStatus === "idle" && <Cloud className="w-4 h-4 opacity-50" />}
      </div>

      <div className="w-[1px] h-5 bg-border-subtle mx-1" />

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

      {onHistoryClick && (
        <>
          <div className="w-[1px] h-5 bg-border-subtle mx-1" />
          <button
            onClick={onHistoryClick}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
            title="Version History"
          >
            <History className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
