"use client";

import { X, Bot, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Handle send
    }
  };

  const starterChips = [
    "Design an e-commerce backend",
    "Create a chat app architecture",
    "Build a CI/CD pipeline",
  ];

  return (
    <div
      className={`relative shrink-0 z-40 h-full bg-bg-surface border-l border-border-subtle shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "w-80" : "w-0"
      }`}
    >
      {/* Inner wrapper: fixed width so content never squishes */}
      <div className="w-80 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-accent-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-primary leading-tight">AI Workspace</span>
              <span className="text-[10px] text-text-muted leading-tight">Collaborate with Glyph AI</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onPointerDown={(e) => { e.stopPropagation(); onClose(); }}
            className="h-8 w-8 text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
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
            </TabsList>
          </div>

          <TabsContent value="architect" className="flex flex-col flex-1 overflow-hidden m-0 outline-none">
            {/* Scrollable Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
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
                      className="text-xs text-left px-4 py-2 rounded-full bg-bg-subtle text-accent-primary hover:bg-bg-elevated transition-colors border border-border-subtle"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border-subtle shrink-0 bg-bg-surface">
              <div className="relative flex items-end gap-2 bg-bg-elevated border border-border-subtle rounded-xl p-2 focus-within:border-accent-primary/50 transition-colors">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Glyph AI..."
                  className="flex-1 max-h-[160px] min-h-[40px] resize-none bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted py-2 px-2 scrollbar-thin"
                  rows={1}
                />
                <Button 
                  size="icon" 
                  className="h-8 w-8 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-bg-base shrink-0 mb-1 mr-1"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-[10px] text-text-faint text-center mt-2">
                Glyph AI can make mistakes. Consider verifying important information.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="flex flex-col flex-1 overflow-hidden m-0 p-4 outline-none">
            <div className="flex flex-col gap-4">
              <Button className="w-full bg-accent-primary hover:bg-accent-primary/90 text-bg-base shadow-sm">
                <FileText className="w-4 h-4 mr-2" />
                Generate Spec
              </Button>
              
              <div className="flex flex-col gap-2 bg-bg-elevated border border-border-subtle p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-primary">Architecture Spec</span>
                </div>
                <p className="text-xs text-text-muted line-clamp-2">
                  This document contains the functional requirements and system architecture based on the current canvas design.
                </p>
                <Button variant="outline" size="sm" className="w-full mt-2 text-text-muted" disabled>
                  Download PDF
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
