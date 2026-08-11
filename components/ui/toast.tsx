"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "default" | "success" | "error" | "info";

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
}

interface ToastContextType {
  toast: (props: Omit<ToastProps, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(({ title, description, type = "default" }: Omit<ToastProps, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={cn(
              "pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm transition-all animate-in slide-in-from-bottom-4 fade-in-10",
              t.type === "default" && "bg-bg-elevated/90 border-border-subtle text-text-primary",
              t.type === "success" && "bg-success-default/10 border-success-default/20 text-success-default",
              t.type === "error" && "bg-error-default/10 border-error-default/20 text-error-default",
              t.type === "info" && "bg-info-default/10 border-info-default/20 text-info-default"
            )}
          >
            <div className="flex flex-col gap-1">
              <span className={cn("text-sm font-semibold", t.type === "default" && "text-text-primary")}>
                {t.title}
              </span>
              {t.description && (
                <span className={cn("text-xs", t.type === "default" ? "text-text-secondary" : "opacity-80")}>
                  {t.description}
                </span>
              )}
            </div>
            <button 
              onClick={() => dismiss(t.id)} 
              className="text-text-muted hover:text-text-primary transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
