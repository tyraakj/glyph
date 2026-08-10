"use client";

import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface CanvasWrapperProps {
  roomId: string;
  children: ReactNode;
}

export function CanvasWrapper({ roomId, children }: CanvasWrapperProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
          isThinking: false,
        }}
      >
        <ClientSideSuspense
          fallback={
            <div className="flex-1 flex items-center justify-center bg-bg-base relative overflow-hidden h-full">
              <div className="absolute inset-0 pattern-dots text-border-subtle opacity-50" />
              <div className="relative z-10 flex flex-col items-center space-y-4 p-6 rounded-2xl bg-bg-elevated/80 backdrop-blur-md border border-border-default shadow-xl">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-text-primary">
                  Connecting to workspace...
                </p>
              </div>
            </div>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
