import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KEYBOARD_SHORTCUTS } from "@/lib/shortcuts";
import { Keyboard } from "lucide-react";

export function KeyboardShortcutsDialog({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
        <DialogHeader className="mb-6">
          <DialogTitle className="flex items-center gap-2 text-text-primary text-xl font-bold">
            <Keyboard className="w-5 h-5 text-accent-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {KEYBOARD_SHORTCUTS.map((group) => (
            <div key={group.name} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                {group.name}
              </h3>
              <div className="flex flex-col gap-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-text-primary">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, kIdx) => (
                        <span 
                          key={kIdx} 
                          className="min-w-6 h-6 px-1.5 flex items-center justify-center text-xs font-medium text-text-primary bg-bg-elevated border border-border-subtle rounded shadow-sm"
                        >
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
    </Dialog>
  );
}
