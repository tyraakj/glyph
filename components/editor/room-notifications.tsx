"use client";

import { useEffect, useRef } from "react";
import { useOthersListener, useEventListener } from "@liveblocks/react/suspense";
import { useToast } from "@/components/ui/toast";

export function RoomNotifications() {
  const { toast } = useToast();
  
  // Keep track of previous others to know who joined or left
  useOthersListener((event) => {
    if (event.type === "enter") {
      toast({
        title: "Collaborator Joined",
        description: event.user.info?.name ? `${event.user.info.name} has joined the room.` : "Someone has joined the room.",
        type: "info",
      });
    } else if (event.type === "leave") {
      toast({
        title: "Collaborator Left",
        description: event.user.info?.name ? `${event.user.info.name} has left the room.` : "Someone has left the room.",
        type: "info",
      });
    }
  });

  useEventListener(({ event }) => {
    if (event.type === "ai-design-update") {
      toast({
        title: "AI Generation Complete",
        description: "Glyph AI has finished updating the canvas architecture.",
        type: "success",
      });
    } else if (event.type === "spec-generation-complete") {
      toast({
        title: "Spec Generation Complete",
        description: "A new technical specification has been generated.",
        type: "success",
      });
    }
  });

  return null;
}
