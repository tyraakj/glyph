"use client"

import * as React from "react"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, Globe, Lock } from "lucide-react"
import type { Project } from "@/generated/prisma"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
}

export function ShareDialog({ open, onOpenChange, project }: ShareDialogProps) {
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [publicToken, setPublicToken] = React.useState<string | null>(project.publicShareToken)
  const [copied, setCopied] = React.useState(false)

  const togglePublicSharing = async () => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enable: !publicToken })
      })
      
      if (!res.ok) throw new Error("Failed to update sharing settings")
      
      const data = await res.json()
      setPublicToken(data.token)
    } catch (err) {
      console.error(err)
      alert("Failed to update sharing settings")
    } finally {
      setIsUpdating(false)
    }
  }

  const publicUrl = publicToken ? `${window.location.origin}/view/${publicToken}` : ""

  const copyToClipboard = async () => {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy", err)
    }
  }

  return (
    <Dialog isOpen={open} onClose={() => onOpenChange(false)}>
      <DialogHeader>
        <DialogTitle>Share "{project.name}"</DialogTitle>
        <DialogDescription>
          Manage who can view or collaborate on this workspace.
        </DialogDescription>
      </DialogHeader>
      
      <div className="mt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4 border border-border-subtle rounded-xl p-4 bg-bg-base/50">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {publicToken ? <Globe className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-text-muted" />}
                <span className="text-sm font-semibold text-text-primary">
                  Public Link Sharing
                </span>
              </div>
              <p className="text-xs text-text-muted">
                {publicToken 
                  ? "Anyone with the link can view a read-only snapshot of this canvas." 
                  : "Only invited collaborators can access this project."}
              </p>
            </div>
            
            <Button
              variant={publicToken ? "outline" : "default"}
              size="sm"
              onClick={togglePublicSharing}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
              {publicToken ? "Disable Link" : "Create Public Link"}
            </Button>
          </div>

          {publicToken && (
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="text" 
                readOnly 
                value={publicUrl} 
                className="flex-1 bg-bg-surface border border-border-default rounded-md px-3 py-2 text-xs text-text-secondary focus:outline-none focus:border-accent-primary"
              />
              <Button onClick={copyToClipboard} variant="secondary" size="sm" className="shrink-0">
                {copied ? "Copied!" : <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy</>}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}
