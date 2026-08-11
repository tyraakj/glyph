import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";

interface UseKeyboardShortcutsProps {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useKeyboardShortcuts({ undo, redo, canUndo, canRedo }: UseKeyboardShortcutsProps) {
  const { zoomIn, zoomOut, getNodes, setNodes } = useReactFlow();

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
        } else if (e.key === "g") {
          e.preventDefault();
          const nodes = getNodes();
          const selectedNodes = nodes.filter((n) => n.selected && !n.parentId && n.type !== "groupNode");
          if (selectedNodes.length > 0) {
            // Find bounding box
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            selectedNodes.forEach(n => {
              if (n.position.x < minX) minX = n.position.x;
              if (n.position.y < minY) minY = n.position.y;
              if (n.position.x + (n.measured?.width || 150) > maxX) maxX = n.position.x + (n.measured?.width || 150);
              if (n.position.y + (n.measured?.height || 50) > maxY) maxY = n.position.y + (n.measured?.height || 50);
            });
            
            const padding = 40;
            const groupId = `group-${Date.now()}`;
            const groupNode = {
              id: groupId,
              type: "groupNode",
              position: { x: minX - padding, y: minY - padding - 20 },
              style: { 
                width: maxX - minX + padding * 2, 
                height: maxY - minY + padding * 2 + 20 
              },
              data: { label: "New Group" },
              selected: true,
            };

            const updatedNodes = nodes.map(n => {
              if (selectedNodes.find(sn => sn.id === n.id)) {
                return {
                  ...n,
                  parentId: groupId,
                  position: { 
                    x: n.position.x - groupNode.position.x, 
                    y: n.position.y - groupNode.position.y 
                  },
                  selected: false,
                };
              }
              return { ...n, selected: false };
            });

            setNodes([...updatedNodes, groupNode]);
          }
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
