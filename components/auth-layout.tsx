import React from "react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-base">
      {/* Left Panel (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 border-r border-surface-border bg-surface">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-copy-primary mb-2">glyph ai</h1>
          <p className="text-copy-muted mb-8 text-lg">
            Real-time collaborative system design workspace.
          </p>
          <ul className="space-y-4 text-copy-secondary">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand" />
              Draw architectures on a shared canvas
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand" />
              Generate designs from text prompts
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand" />
              Export graphs to Markdown specs
            </li>
          </ul>
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
