import { useOthers, useUpdateMyPresence } from "@liveblocks/react/suspense";
import { MousePointer2 } from "lucide-react";

export function LiveCursors() {
  const others = useOthers();

  return (
    <>
      {others.map((other) => {
        const cursor = other.presence?.cursor;
        const info = other.info;

        if (!cursor || !info) return null;

        return (
          <div
            key={other.connectionId}
            className="pointer-events-none absolute left-0 top-0 z-50 transition-transform duration-100 ease-out"
            style={{
              transform: `translate(${cursor.x}px, ${cursor.y}px)`,
            }}
          >
            <MousePointer2
              className="h-5 w-5"
              fill={info.color || "#52A8FF"}
              color={info.color || "#52A8FF"}
            />
            <div
              className="absolute left-4 top-4 rounded-md px-2 py-0.5 text-xs font-semibold text-white whitespace-nowrap drop-shadow-md"
              style={{ backgroundColor: info.color || "#52A8FF" }}
            >
              {info.name}
            </div>
          </div>
        );
      })}
    </>
  );
}
