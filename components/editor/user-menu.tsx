"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />;
  }

  if (!session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <div className="relative group">
      <button className="flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-surface-border text-copy-primary hover:bg-bg-subtle transition-colors">
        <User className="w-4 h-4" />
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-bg-elevated border border-surface-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none group-hover:pointer-events-auto z-50">
        <div className="p-3 border-b border-surface-border">
          <p className="text-sm font-medium text-copy-primary truncate">{session.user.name}</p>
          <p className="text-xs text-copy-muted truncate">{session.user.email}</p>
        </div>
        <div className="p-1">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-copy-primary hover:bg-bg-subtle rounded-lg text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
