import { NextResponse } from "next/server";
import { liveblocks, getUserColor } from "@/lib/liveblocks";
import { getProjectAccess } from "@/lib/project-access";
import { LiveblocksError } from "@liveblocks/node";

export async function POST(req: Request) {
  try {
    const { room } = await req.json();

    if (!room || typeof room !== "string") {
      return NextResponse.json(
        { error: "Invalid room ID" },
        { status: 400 }
      );
    }

    if (room.includes("*")) {
      return NextResponse.json(
        { error: "Wildcards are not permitted" },
        { status: 400 }
      );
    }

    // The frontend passes the room ID as the Liveblocks room name (which might be in [id]-[slug] format).
    // Our Project IDs exactly match the Liveblocks room IDs (the CUID part).
    const idMatch = room.match(/^([^-]+)-/);
    const projectId = idMatch ? idMatch[1] : room;

    const { user, project, error } = await getProjectAccess(projectId);

    if (error === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (error || !project) {
      return NextResponse.json(
        { error: "Forbidden: You do not have access to this room" },
        { status: 403 }
      );
    }

    // Ensure the room exists in Liveblocks
    try {
      await liveblocks.getRoom(room);
    } catch (err: any) {
      // If the room doesn't exist, Liveblocks throws an error with status 404
      if (err instanceof LiveblocksError && err.status === 404) {
        await liveblocks.createRoom(room, {
          defaultAccesses: [], // Empty default means only authorized sessions can access
        });
      } else {
        throw err;
      }
    }

    // Identify the user and provide their metadata for Liveblocks Presence
    const session = liveblocks.prepareSession(
      user.id,
      {
        userInfo: {
          name: user.name || "Anonymous User",
          avatar: user.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.id}`,
          color: getUserColor(user.id),
        }
      }
    );

    // Grant full access to this specific room
    session.allow(room, session.FULL_ACCESS);

    // Authorize and return the session token
    const { status, body } = await session.authorize();
    
    return new Response(body, { status });
  } catch (err: any) {
    console.error("Liveblocks Auth Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
