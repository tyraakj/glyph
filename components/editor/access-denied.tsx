import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-bg-surface text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-base border border-border-subtle mb-6">
        <Lock className="h-8 w-8 text-text-muted" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">Access Denied</h2>
      <p className="text-sm text-text-secondary mb-6 max-w-sm">
        You don't have permission to view this project, or it doesn't exist.
      </p>
      <Link href="/editor">
        <Button variant="default">Return to Dashboard</Button>
      </Link>
    </div>
  );
}
