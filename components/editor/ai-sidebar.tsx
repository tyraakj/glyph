"use client";

import { X, Bot, FileText, Send, Loader2, Settings, ShieldAlert, AlertTriangle, Info } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import { useEventListener, useUpdateMyPresence, useSelf, useBroadcastEvent, useStorage, useMutation } from "@liveblocks/react/suspense";
import { type AiStatusFeedPayload, type AiChatFeedPayload, AiChatFeedPayloadSchema } from "@/types/tasks";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useDesignStream } from "@/hooks/use-design-stream";
import { useCritiqueStream } from "@/hooks/use-critique-stream";
import { useApiKey } from "@/hooks/use-api-key";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [input, setInput] = useState("");
  const messages = useStorage((root) => root.chatHistory) || [];
  const addMessage = useMutation(({ storage }, message: AiChatFeedPayload) => {
    storage.get("chatHistory").push(message);
  }, []);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { apiKey, setApiKey } = useApiKey();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [runId, setRunId] = useState<string | null>(null);
  const { status: runStatus, message: runMessage, isRunning } = useDesignStream(runId);
  
  const params = useParams();
  const roomId = typeof params?.roomId === 'string' ? params.roomId : '';
  const projectId = roomId.match(/^([^-]+)-/)?.[1] || roomId;
  
  const updateMyPresence = useUpdateMyPresence();
  const broadcast = useBroadcastEvent();
  const me = useSelf();
  const isThinking = me.presence.isThinking;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle run completion
  useEffect(() => {
    if (runId && !isRunning && (runStatus === "complete" || runStatus === "error")) {
      const isError = runStatus === "error";
      
      const finalMsg: AiChatFeedPayload = {
        type: "ai-chat",
        sender: "Glyph AI",
        role: "assistant",
        content: isError 
          ? runMessage || "An error occurred."
          : runMessage || "I've completed the design updates on the canvas! Check out the changes.",
        timestamp: new Date().toISOString(),
      };
      
      addMessage(finalMsg);
      setRunId(null);
    }
  }, [runId, isRunning, runStatus, runMessage, addMessage]);

  const handleSend = async () => {
    if (!input.trim() || isRunning) return;

    const promptText = input.trim();
    setInput("");

    // 1. Create chat message
    const chatMsg: AiChatFeedPayload = {
      type: "ai-chat",
      sender: me.info?.name || "User",
      role: "user",
      content: promptText,
      timestamp: new Date().toISOString(),
    };

    // Add locally instantly
    addMessage(chatMsg);

    try {
      // Pass the chat history to the API so the AI has context
      const currentHistory = Array.from(messages);
      // Take last 20 messages for context (excluding the one we just added)
      const contextMessages = currentHistory.slice(0, -1).slice(-20).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: promptText, 
          roomId, 
          projectId, 
          apiKey: apiKey || undefined,
          chatHistory: contextMessages
        }),
      });
      const data = await res.json();
      if (data.runId) {
        setRunId(data.runId);
      } else {
        throw new Error(data.error || "Failed to start design run");
      }
    } catch (err: any) {
      const errorMsg: AiChatFeedPayload = {
        type: "ai-chat",
        sender: "System",
        role: "system",
        content: err.message,
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMsg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const starterChips = [
    "Design an e-commerce backend",
    "Create a chat app architecture",
    "Build a CI/CD pipeline",
  ];

  useEffect(() => {
    console.log("[AiSidebar] Rendered with isOpen:", isOpen);
  }, [isOpen]);

  return (
    <div
      className={cn(
        "relative shrink-0 z-40 h-full bg-bg-surface border-border-subtle shadow-2xl transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "w-[320px] min-w-[320px] border-l opacity-100" : "w-0 min-w-0 border-none opacity-0"
      )}
    >
      {/* Inner wrapper: fixed width so content never squishes */}
      <div className="w-[320px] min-w-[320px] h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-accent-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-primary leading-tight">AI Workspace</span>
              <span className="text-[10px] text-text-muted leading-tight">Collaborate with Glyph AI</span>
            </div>
          </div>
          <div className="flex items-center gap-1 relative">
            <Button
              variant="ghost"
              size="icon"
              onPointerDown={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(!isSettingsOpen);
              }}
              className="h-8 w-8 text-text-muted hover:text-text-primary"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onPointerDown={(e) => { 
                console.log("[AiSidebar] Close button onPointerDown fired!");
                e.stopPropagation(); 
                onClose(); 
              }}
              className="h-8 w-8 text-text-muted hover:text-text-primary"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
            
            {/* Settings Popover */}
            {isSettingsOpen && (
              <div className="absolute top-10 right-0 w-64 bg-bg-surface border border-border-subtle shadow-xl rounded-xl p-4 z-50">
                <h3 className="text-sm font-semibold text-text-primary mb-2">AI Settings</h3>
                <label className="text-xs text-text-secondary block mb-1">
                  Bring Your Own API Key
                </label>
                <input
                  type="password"
                  placeholder="Gemini API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-bg-base border border-border-default rounded-md px-3 py-1.5 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-accent-primary transition-colors"
                />
                <p className="text-[10px] text-text-muted mt-2 leading-tight">
                  Optional. Overrides default limits. Stored securely in your local browser storage.
                </p>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="architect" className="flex flex-col flex-1 overflow-hidden">
          <div className="px-4 py-2 shrink-0">
            <TabsList className="w-full bg-bg-elevated border border-border-subtle">
              <TabsTrigger 
                value="architect" 
                className="flex-1 data-[state=active]:bg-accent-primary/10 data-[state=active]:text-accent-primary text-text-muted"
              >
                AI Architect
              </TabsTrigger>
              <TabsTrigger 
                value="specs" 
                className="flex-1 data-[state=active]:bg-accent-primary/10 data-[state=active]:text-accent-primary text-text-muted"
              >
                Specs
              </TabsTrigger>
              <TabsTrigger 
                value="critique" 
                className="flex-1 data-[state=active]:bg-accent-primary/10 data-[state=active]:text-accent-primary text-text-muted"
              >
                Critique
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="flex-1 data-[state=active]:bg-accent-primary/10 data-[state=active]:text-accent-primary text-text-muted"
              >
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="architect" className="flex flex-col flex-1 overflow-hidden m-0 outline-none">
            {/* Scrollable Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 mt-8">
                  <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center mb-2">
                    <Bot className="w-6 h-6 text-accent-primary" />
                  </div>
                  <p className="text-sm text-text-primary max-w-[240px]">
                    I can help you design architectures, suggest components, and write specifications.
                  </p>
                  
                  <div className="flex flex-col gap-2 mt-4 w-full">
                    {starterChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(chip)}
                        className="text-xs text-left px-4 py-2 rounded-full bg-bg-subtle text-accent-primary hover:bg-bg-elevated transition-colors border border-border-subtle"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 pb-2">
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex flex-col gap-1 max-w-[85%]", 
                        msg.role === "user" ? "self-end items-end" : "self-start items-start"
                      )}
                    >
                      <span className="text-[10px] text-text-muted">{msg.sender}</span>
                      <div 
                        className={cn(
                          "px-3 py-2 rounded-2xl text-sm shadow-sm break-words whitespace-pre-wrap", 
                          msg.role === "user" 
                            ? "bg-accent-primary text-bg-base rounded-tr-sm" 
                            : "bg-bg-elevated border border-border-subtle text-text-primary rounded-tl-sm"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* AI Status Feed (Above Input) */}
            {isRunning && (
              <div className="px-4 pb-2 shrink-0">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-elevated border border-border-subtle shadow-sm">
                  <Loader2 className="w-4 h-4 text-accent-primary animate-spin shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-text-primary truncate">
                      {runMessage || "Processing..."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border-subtle shrink-0 bg-bg-surface">
              <div className="relative flex items-end gap-2 bg-bg-elevated border border-border-subtle rounded-xl p-2 focus-within:border-accent-primary/50 transition-colors">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Glyph AI..."
                  disabled={isRunning}
                  className="flex-1 max-h-[160px] min-h-[40px] resize-none bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted py-2 px-2 scrollbar-thin disabled:opacity-50"
                  rows={1}
                />
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={isRunning || !input.trim()}
                  className="h-8 w-8 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-bg-base shrink-0 mb-1 mr-1 disabled:opacity-50"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <div className="text-[10px] text-text-faint text-center mt-2">
                Glyph AI can make mistakes. Consider verifying important information.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="flex flex-col flex-1 overflow-hidden m-0 p-4 outline-none">
            <SpecListTab roomId={roomId} projectId={projectId} apiKey={apiKey} />
          </TabsContent>

          <TabsContent value="critique" className="flex flex-col flex-1 overflow-hidden m-0 p-4 outline-none">
            <CritiqueTab roomId={roomId} projectId={projectId} apiKey={apiKey} />
          </TabsContent>

          <TabsContent value="activity" className="flex flex-col flex-1 overflow-hidden m-0 p-4 outline-none">
            <ActivityTab projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Subcomponent for Specs Tab to manage its own state
function SpecListTab({ roomId, projectId, apiKey }: { roomId: string, projectId: string, apiKey: string }) {
  const [specs, setSpecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Preview Modal State
  const [previewSpec, setPreviewSpec] = useState<any | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchSpecs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/specs`);
      if (res.ok) {
        const data = await res.json();
        setSpecs(data.specs || []);
      }
    } catch (e) {
      console.error("Failed to fetch specs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchSpecs();
    }
  }, [projectId]);

  const [templateId, setTemplateId] = useState<string>("simple");

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, projectId, apiKey: apiKey || undefined, templateId }),
      });
      if (res.ok) {
        alert("Spec generation started in the background. It will appear here shortly.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to start spec generation.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = async (spec: any) => {
    setPreviewSpec(spec);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/specs/${spec.id}/download?preview=true`);
      if (res.ok) {
        const text = await res.text();
        setPreviewContent(text);
      } else {
        setPreviewContent("Failed to load spec content.");
      }
    } catch (e) {
      setPreviewContent("Error loading spec content.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = (spec: any) => {
    window.open(`/api/projects/${projectId}/specs/${spec.id}/download`, "_blank");
  };

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="flex flex-col gap-2 shrink-0">
        <select 
          value={templateId} 
          onChange={(e) => setTemplateId(e.target.value)}
          disabled={generating}
          className="w-full h-9 rounded-md border border-border-subtle bg-bg-surface px-3 py-1 text-sm text-text-primary shadow-sm focus:outline-none focus:ring-1 focus:ring-accent-primary"
        >
          <option value="simple">Simple Summary</option>
          <option value="rfc">RFC-2119 Style</option>
          <option value="c4">C4 Model Structure</option>
          <option value="aws-well-architected">AWS Well-Architected</option>
        </select>

        <Button 
          onClick={handleGenerate} 
          disabled={generating}
          className="w-full bg-accent-primary hover:bg-accent-primary/90 text-bg-base shadow-sm"
        >
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
          Generate New Spec
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
          </div>
        ) : specs.length === 0 ? (
          <div className="text-center p-8 text-sm text-text-muted">
            No specs generated yet.
          </div>
        ) : (
          specs.map((spec) => (
            <div key={spec.id} className="flex flex-col gap-2 bg-bg-elevated border border-border-subtle p-3 rounded-xl group hover:border-accent-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-text-muted group-hover:text-accent-primary transition-colors" />
                <span className="text-sm font-medium text-text-primary truncate">{spec.filename}</span>
              </div>
              <p className="text-[10px] text-text-muted">
                {new Date(spec.createdAt).toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePreview(spec)}
                  className="flex-1 h-8 text-xs bg-bg-surface hover:bg-bg-subtle text-text-primary border-border-subtle hover:text-accent-primary"
                >
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownload(spec)}
                  className="flex-1 h-8 text-xs bg-bg-surface hover:bg-bg-subtle text-text-primary border-border-subtle"
                >
                  Download
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Absolute Preview Overlay inside the sidebar to avoid external modals breaking layout, or we can use a fixed full-screen modal */}
      {previewSpec && (
        <div className="fixed inset-0 z-50 bg-bg-base/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-elevated">
              <h3 className="font-medium text-text-primary">{previewSpec.filename}</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload(previewSpec)}>
                  Download
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setPreviewSpec(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-bg-base prose prose-sm prose-invert max-w-none">
              {previewLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-text-primary">{previewContent}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent for Critique Tab
function CritiqueTab({ roomId, projectId, apiKey }: { roomId: string, projectId: string, apiKey: string }) {
  const { getNodes, getEdges, setNodes } = useReactFlow();
  const [runId, setRunId] = useState<string | null>(null);
  
  const { status, message, findings, summary, isRunning } = useCritiqueStream(runId);

  const handleCritique = async () => {
    if (isRunning) return;
    
    try {
      const nodes = getNodes();
      const edges = getEdges();
      
      const res = await fetch("/api/ai/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, nodes, edges, apiKey: apiKey || undefined }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setRunId(data.runId);
      } else {
        alert("Failed to start critique.");
      }
    } catch (e) {
      console.error(e);
      alert("Error triggering critique.");
    }
  };

  const handleMouseEnter = (nodeId: string) => {
    setNodes((nds) => 
      nds.map(n => n.id === nodeId ? { ...n, selected: true } : n)
    );
  };

  const handleMouseLeave = (nodeId: string) => {
    setNodes((nds) => 
      nds.map(n => n.id === nodeId ? { ...n, selected: false } : n)
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-4 shrink-0">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Architecture Critique</h3>
        <p className="text-xs text-text-muted mb-4">
          Have Glyph AI review your current canvas for anti-patterns, missing components, and scaling bottlenecks.
        </p>
        <Button 
          onClick={handleCritique} 
          disabled={isRunning}
          className="w-full bg-accent-primary hover:bg-accent-primary/90 text-bg-base"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Architecture...
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 mr-2" />
              Review Architecture
            </>
          )}
        </Button>
      </div>

      {isRunning && (
        <div className="p-3 shrink-0 bg-bg-elevated border border-border-subtle rounded-lg mb-4 text-xs text-text-primary flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />
          {message}
        </div>
      )}

      {!isRunning && status === "error" && (
        <div className="p-3 shrink-0 bg-error-default/10 border border-error-default/20 rounded-lg mb-4 text-xs text-error-default flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {message}
        </div>
      )}

      {status === "complete" && summary && (
        <div className="mb-4 shrink-0 text-sm text-text-primary p-3 bg-bg-elevated border border-border-subtle rounded-lg">
          <span className="font-semibold block mb-1">Summary</span>
          <span className="text-xs text-text-secondary">{summary}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin pb-4">
        {findings.map((finding, idx) => {
          const isError = finding.severity === "error";
          const isWarning = finding.severity === "warning";
          
          return (
            <div 
              key={idx} 
              onMouseEnter={() => handleMouseEnter(finding.nodeId)}
              onMouseLeave={() => handleMouseLeave(finding.nodeId)}
              className={cn(
                "p-3 rounded-lg border flex flex-col gap-1 text-left transition-colors cursor-default",
                isError ? "bg-error-default/5 border-error-default/20 hover:border-error-default/50 hover:bg-error-default/10" :
                isWarning ? "bg-warning-default/5 border-warning-default/20 hover:border-warning-default/50 hover:bg-warning-default/10" :
                "bg-info-default/5 border-info-default/20 hover:border-info-default/50 hover:bg-info-default/10"
              )}
            >
              <div className="flex items-start gap-2 mb-1">
                {isError ? (
                  <ShieldAlert className="w-4 h-4 text-error-default shrink-0 mt-0.5" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-warning-default shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-info-default shrink-0 mt-0.5" />
                )}
                <span className={cn(
                  "font-semibold text-xs leading-tight",
                  isError ? "text-error-default" :
                  isWarning ? "text-warning-default" :
                  "text-info-default"
                )}>
                  {finding.title}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed ml-6">
                {finding.description}
              </p>
              <div className="mt-2 ml-6 text-[11px] font-medium text-text-primary bg-bg-base/50 p-2 rounded border border-border-subtle">
                <span className="opacity-70 mr-1">Suggestion:</span> {finding.suggestion}
              </div>
            </div>
          );
        })}
        
        {status === "complete" && findings.length === 0 && (
          <div className="text-center text-sm text-text-muted mt-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success-default/10 text-success-default mb-2">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <p>Looking good! No major issues found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityTab({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/activity`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.activityLogs || []);
      }
    } catch (e) {
      console.error("Failed to fetch activity", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchActivity();
      const interval = setInterval(fetchActivity, 10000);
      return () => clearInterval(interval);
    }
  }, [projectId]);

  if (loading && logs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center mt-8">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
        <p className="text-sm text-text-muted">Loading activity...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center mt-8">
        <p className="text-sm text-text-muted">No recent activity.</p>
      </div>
    );
  }

  const formatAction = (action: string) => {
    return action.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-10">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-3 text-sm p-3 rounded-lg bg-bg-elevated border border-border-subtle shadow-sm">
          <div className="w-8 h-8 rounded-full bg-accent-primary/20 shrink-0 flex items-center justify-center overflow-hidden">
            {log.user?.image ? (
              <img src={log.user.image} alt={log.user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-accent-primary font-bold text-xs">{log.user?.name?.charAt(0) || '?'}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-text-primary leading-tight">
              <span className="font-semibold">{log.user?.name || 'Someone'}</span> {formatAction(log.action)}
            </span>
            <span className="text-[10px] text-text-muted mt-0.5">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
