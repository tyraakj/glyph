import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";

interface UseKeyboardShortcutsProps {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useKeyboardShortcuts({ undo, redo, canUndo, canRedo }: UseKeyboardShortcutsProps) {
  const { zoomIn, zoomOut } = useReactFlow();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing in an input, textarea, or contenteditable element
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl) {
        if (e.key === "z") {
          e.preventDefault();
          if (canUndo) undo();
        } else if (e.key === "Z" || (e.key === "y" && !e.shiftKey)) {
          // Cmd+Shift+Z or Cmd+Y
          e.preventDefault();
          if (canRedo) redo();
        }
      } else {
        // Without modifiers
        if (e.key === "+" || e.key === "=") {
          zoomIn({ duration: 200 });
        } else if (e.key === "-") {
          zoomOut({ duration: 200 });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomIn, zoomOut, undo, redo, canUndo, canRedo]);
}
