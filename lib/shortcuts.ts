export interface ShortcutGroup {
  name: string;
  shortcuts: { keys: string[]; description: string }[];
}

export const KEYBOARD_SHORTCUTS: ShortcutGroup[] = [
  {
    name: "General",
    shortcuts: [
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Ctrl", "/"], description: "Show keyboard shortcuts" },
    ]
  },
  {
    name: "Canvas Navigation",
    shortcuts: [
      { keys: ["Space", "Drag"], description: "Pan canvas" },
      { keys: ["Ctrl", "Scroll"], description: "Zoom canvas" },
      { keys: ["Shift", "Drag"], description: "Selection marquee" },
    ]
  },
  {
    name: "Node Editing",
    shortcuts: [
      { keys: ["Ctrl", "G"], description: "Group selected nodes" },
      { keys: ["Backspace"], description: "Delete selected nodes/edges" },
      { keys: ["Delete"], description: "Delete selected nodes/edges" },
      { keys: ["Ctrl", "Z"], description: "Undo" },
      { keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
      { keys: ["Double Click"], description: "Edit node text" },
    ]
  },
  {
    name: "AI Actions",
    shortcuts: [
      { keys: ["Enter"], description: "Send AI message (when chat focused)" },
    ]
  }
];
