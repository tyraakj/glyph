import { useState, useEffect, useMemo } from "react";
import { ReactFlow, Background, BackgroundVariant, MiniMap, ConnectionMode, ReactFlowProvider } from "@xyflow/react";
import { Loader2, ArrowLeft, RotateCcw, GitCompare } from "lucide-react";
import { CanvasNodeComponent } from "@/components/editor/nodes/canvas-node";
import { CanvasEdgeComponent } from "@/components/editor/edges/canvas-edge";

const nodeTypes = {
  canvasNode: CanvasNodeComponent,
};

const edgeTypes = {
  canvasEdge: CanvasEdgeComponent,
};

type CanvasVersion = {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userImage: string | null;
  nodeCount: number;
  edgeCount: number;
  source: string;
  label: string | null;
  createdAt: string;
};

export function VersionPreviewCanvas({ 
  version, 
  currentNodes = [],
  currentEdges = [],
  onClose,
  onRestore
}: { 
  version: CanvasVersion;
  currentNodes?: any[];
  currentEdges?: any[];
  onClose: () => void;
  onRestore: (versionId: string) => Promise<void>;
}) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");
  const [diffMode, setDiffMode] = useState(false);

  useEffect(() => {
    async function loadVersion() {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${version.projectId}/versions/${version.id}`);
        if (!res.ok) throw new Error("Failed to load version data");
        const data = await res.json();
        
        setNodes(data.canvas?.nodes || []);
        setEdges(data.canvas?.edges || []);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    
    loadVersion();
  }, [version]);

  const handleRestore = async () => {
    if (!window.confirm("Are you sure you want to restore this version? This will overwrite your current canvas state.")) {
      return;
    }
    
    setRestoring(true);
    try {
      await onRestore(version.id);
    } catch (err: any) {
      alert("Failed to restore: " + err.message);
      setRestoring(false);
    }
  };

  const displayNodes = useMemo(() => {
    if (!diffMode) return nodes;

    const currentNodesMap = new Map(currentNodes.map(n => [n.id, n]));
    const previewNodesMap = new Map(nodes.map(n => [n.id, n]));

    const mergedNodesMap = new Map();

    // From current canvas
    for (const cn of currentNodes) {
      const pn = previewNodesMap.get(cn.id);
      if (!pn) {
        // Node is in current but not in preview => Added since snapshot
        mergedNodesMap.set(cn.id, { ...cn, data: { ...cn.data, diffStatus: 'added' } });
      } else {
        // In both
        const isModified = JSON.stringify(cn.data) !== JSON.stringify(pn.data) || 
                           cn.position.x !== pn.position.x || 
                           cn.position.y !== pn.position.y;
        mergedNodesMap.set(cn.id, { ...cn, data: { ...cn.data, diffStatus: isModified ? 'modified' : 'unchanged' } });
      }
    }

    // From preview canvas
    for (const pn of nodes) {
      if (!currentNodesMap.has(pn.id)) {
        // Node is in preview but not in current => Removed since snapshot
        mergedNodesMap.set(pn.id, { ...pn, data: { ...pn.data, diffStatus: 'removed' } });
      }
    }

    return Array.from(mergedNodesMap.values());
  }, [nodes, currentNodes, diffMode]);

  return (
    <div className="absolute inset-0 z-[60] bg-bg-base flex flex-col pointer-events-auto">
      {/* Top Banner */}
      <div className="h-14 bg-bg-elevated border-b border-border-subtle flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Current
          </button>
          
          <div className="h-6 w-[1px] bg-border-subtle mx-2" />
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">
              Previewing {version.label ? `"${version.label}"` : `version from ${new Date(version.createdAt).toLocaleString()}`}
            </span>
            <span className="text-sm text-text-muted">
              by {version.userName}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-border-subtle mx-2" />

          <button
            onClick={() => setDiffMode(!diffMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              diffMode ? "bg-accent-primary/20 text-accent-primary" : "bg-bg-subtle text-text-secondary hover:text-text-primary hover:bg-bg-default"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Diff Mode {diffMode ? "ON" : "OFF"}
          </button>
        </div>
        
        <button
          onClick={handleRestore}
          disabled={restoring || loading || !!error}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-bg-base font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          Restore This Version
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-bg-base">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/50 backdrop-blur-sm z-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-primary mb-4" />
            <p className="text-text-secondary font-medium">Loading snapshot...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-xl max-w-md text-center">
              <h3 className="font-semibold mb-2">Error Loading Version</h3>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        ) : (
          <ReactFlowProvider>
            <ReactFlow
              nodes={displayNodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={true}
              zoomOnScroll={true}
              zoomOnDoubleClick={false}
              connectionMode={ConnectionMode.Loose}
              className="pointer-events-auto"
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="var(--color-border-subtle)" />
              <MiniMap 
                nodeColor="var(--color-primary)" 
                maskColor="var(--color-bg-base-alpha-80)" 
                className="bg-bg-surface border-border-default rounded-lg shadow-sm"
              />
            </ReactFlow>
          </ReactFlowProvider>
        )}
      </div>
    </div>
  );
}
