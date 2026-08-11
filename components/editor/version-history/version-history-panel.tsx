import { useState, useEffect } from "react";
import { Loader2, X, History, Sparkles, Bot, Save, Copy, Undo2 } from "lucide-react";

type CanvasVersion = {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  nodeCount: number;
  edgeCount: number;
  source: string;
  label: string | null;
  createdAt: string;
};

// Native relative time formatter
function formatDistanceToNow(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
}

export function VersionHistoryPanel({ 
  projectId, 
  onClose,
  onSelectVersion
}: { 
  projectId: string;
  onClose: () => void;
  onSelectVersion: (version: CanvasVersion) => void;
}) {
  const [versions, setVersions] = useState<CanvasVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchVersions() {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${projectId}/versions`);
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        setVersions(data.versions || []);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    
    fetchVersions();
  }, [projectId]);

  // Group by date
  const grouped = versions.reduce((acc, version) => {
    const d = new Date(version.createdAt);
    const dateStr = d.toLocaleDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(version);
    return acc;
  }, {} as Record<string, CanvasVersion[]>);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "ai-generation": return <Sparkles className="w-3 h-3 text-accent-primary" />;
      case "template-import": return <Copy className="w-3 h-3 text-emerald-500" />;
      case "restore": return <Undo2 className="w-3 h-3 text-orange-500" />;
      default: return <Save className="w-3 h-3 text-text-muted" />;
    }
  };

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-bg-surface border-l border-border-subtle shadow-2xl flex flex-col z-50 pointer-events-auto transition-transform duration-300">
      <div className="flex items-center justify-between p-4 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2 text-text-primary">
          <History className="w-5 h-5" />
          <h2 className="font-semibold text-sm">Version History</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin flex flex-col gap-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            {error}
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center text-sm text-text-muted py-8">
            No history recorded yet.
          </div>
        ) : (
          Object.entries(grouped).map(([dateStr, dateVersions]) => (
            <div key={dateStr} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider sticky top-0 bg-bg-surface/90 backdrop-blur pb-1 z-10">
                {dateStr}
              </h3>
              
              <div className="flex flex-col gap-2">
                {dateVersions.map(version => (
                  <button
                    key={version.id}
                    onClick={() => onSelectVersion(version)}
                    className="flex flex-col gap-2 p-3 rounded-xl border border-border-subtle bg-bg-elevated hover:border-accent-primary/50 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-start gap-3 w-full">
                      {version.userImage ? (
                        <img src={version.userImage} alt={version.userName} className="w-8 h-8 rounded-full border border-border-subtle shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-bg-subtle border border-border-subtle shrink-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-text-primary">{version.userName[0]}</span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-text-primary truncate">{version.userName}</span>
                          <span className="text-[10px] text-text-muted shrink-0">
                            {formatDistanceToNow(version.createdAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {getSourceIcon(version.source)}
                          <span className="text-xs text-text-secondary capitalize">{version.source.replace("-", " ")}</span>
                        </div>
                        
                        {version.label && (
                          <p className="text-xs text-text-primary mt-1.5 italic line-clamp-2">
                            "{version.label}"
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-text-faint font-medium">
                          <span>{version.nodeCount} nodes</span>
                          <span>{version.edgeCount} edges</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
