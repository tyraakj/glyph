import * as React from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates";
import { CopyPlus } from "lucide-react";

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  // Compute bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  template.nodes.forEach(n => {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + (Number(n.style?.width) || 140));
    maxY = Math.max(maxY, n.position.y + (Number(n.style?.height) || 60));
  });

  const pad = 40;
  const vbWidth = maxX - minX + pad * 2;
  const vbHeight = maxY - minY + pad * 2;

  // Render a simple SVG
  return (
    <svg viewBox={`${minX - pad} ${minY - pad} ${vbWidth} ${vbHeight}`} className="w-full h-full text-border-subtle" style={{ minHeight: '140px' }}>
      {/* Edges */}
      {template.edges.map(e => {
        const sourceNode = template.nodes.find(n => n.id === e.source);
        const targetNode = template.nodes.find(n => n.id === e.target);
        if (!sourceNode || !targetNode) return null;

        const sx = sourceNode.position.x + (Number(sourceNode.style?.width) || 140) / 2;
        const sy = sourceNode.position.y + (Number(sourceNode.style?.height) || 60) / 2;
        const tx = targetNode.position.x + (Number(targetNode.style?.width) || 140) / 2;
        const ty = targetNode.position.y + (Number(targetNode.style?.height) || 60) / 2;

        return <line key={e.id} x1={sx} y1={sy} x2={tx} y2={ty} stroke="currentColor" strokeWidth="2" />;
      })}
      
      {/* Nodes */}
      {template.nodes.map(n => {
        const w = Number(n.style?.width) || 140;
        const h = Number(n.style?.height) || 60;
        const cx = n.position.x + w / 2;
        const cy = n.position.y + h / 2;

        if (n.data.shape === "circle" || n.data.shape === "diamond" || n.data.shape === "hexagon") {
          return <circle key={n.id} cx={cx} cy={cy} r={Math.min(w, h)/2} fill={n.data.color as string || "#1F1F1F"} stroke={n.data.textColor as string || "#EDEDED"} strokeWidth="2" opacity={0.8} />;
        }
        
        const rx = n.data.shape === "pill" ? h/2 : 8;
        return <rect key={n.id} x={n.position.x} y={n.position.y} width={w} height={h} rx={rx} fill={n.data.color as string || "#1F1F1F"} stroke={n.data.textColor as string || "#EDEDED"} strokeWidth="2" opacity={0.8} />;
      })}
    </svg>
  );
}

export function StarterTemplatesModal({ open, onOpenChange }: StarterTemplatesModalProps) {
  const handleImport = (template: CanvasTemplate) => {
    window.dispatchEvent(new CustomEvent("import-starter-template", { detail: template }));
    onOpenChange(false);
  };

  return (
    <Dialog isOpen={open} onClose={() => onOpenChange(false)}>
      <div className="w-full sm:w-[750px] max-w-full">
        <DialogHeader>
          <DialogTitle>Starter Templates</DialogTitle>
          <DialogDescription>
            Choose a pre-built architecture to get started quickly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 max-h-[60vh] overflow-y-auto pr-2">
          {CANVAS_TEMPLATES.map(template => (
            <div key={template.id} className="flex flex-col border border-border-subtle bg-bg-surface rounded-2xl overflow-hidden shadow-sm hover:border-accent-primary transition-colors group">
              <div className="bg-bg-base border-b border-border-subtle p-4 flex items-center justify-center relative overflow-hidden">
                <TemplatePreview template={template} />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h4 className="text-sm font-semibold text-text-primary mb-1">{template.name}</h4>
                <p className="text-xs text-text-secondary flex-1 mb-4">{template.description}</p>
                <Button 
                  onClick={() => handleImport(template)}
                  variant="default"
                  size="sm" 
                  className="w-full opacity-90 group-hover:opacity-100 transition-opacity"
                >
                  <CopyPlus className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
