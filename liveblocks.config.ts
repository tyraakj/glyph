import type { AiStatusFeedPayload, AiChatFeedPayload, AiDesignUpdatePayload } from "./types/tasks";

// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for example, their cursor
    Presence: {
      cursor: { x: number; y: number } | null;
      isThinking: boolean;
    };

    // The Storage tree for the room, for example, an array of notes
    Storage: {
      chatHistory: import("@liveblocks/client").LiveList<{
        role: "user" | "ai";
        content: string;
        timestamp: number;
        sender?: string;
      }>;
    };

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    // Custom events, for example for broadcasted messages
    RoomEvent: AiStatusFeedPayload | AiChatFeedPayload | AiDesignUpdatePayload;

    // Custom metadata set on threads, for example, to note where a thread is on a canvas
    ThreadMetadata: {
      x: number;
      y: number;
    };

    // Custom room info set with resolveRoomsInfo
    RoomInfo: {};
  }
}

export {};
