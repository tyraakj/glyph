import { Liveblocks } from "@liveblocks/node";

const secret = process.env.LIVEBLOCKS_SECRET_KEY;

if (!secret && process.env.NODE_ENV !== "development") {
  console.warn("LIVEBLOCKS_SECRET_KEY is missing in environment variables");
}

export const liveblocks = new Liveblocks({
  secret: secret || "sk_test_dummy",
});

const CURSOR_COLORS = [
  "#FF3B30", // Red
  "#FF9500", // Orange
  "#FFCC00", // Yellow
  "#4CD964", // Green
  "#5AC8FA", // Light Blue
  "#007AFF", // Blue
  "#5856D6", // Purple
  "#FF2D55", // Pink
  "#A2845E", // Brown
];

/**
 * Deterministically generates a cursor color based on a string (like userId)
 */
export function getUserColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CURSOR_COLORS.length;
  return CURSOR_COLORS[index];
}
