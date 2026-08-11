import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getProjectAccess } from "@/lib/project-access";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { roomId, chatHistory, nodes, edges } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: "Missing required fields (roomId)" },
        { status: 400 }
      );
    }

    // Resolve project access from roomId
    const idMatch = roomId.match(/^([^-]+)-/);
    const projectId = idMatch ? idMatch[1] : roomId;

    const { error, project } = await getProjectAccess(projectId);
    
    if (error === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (error || !project) {
      return NextResponse.json({ error: "Forbidden: You do not have access to this room" }, { status: 403 });
    }

    // Generate a unique run ID
    const runId = crypto.randomUUID();

    // Save the TaskRun to our database for ownership tracking
    await prisma.taskRun.create({
      data: {
        runId,
        projectId,
        userId: session.user.id,
        status: "queued",
      },
    });

    // Set the initial status in Redis (expires in 1 hour)
    await redis.setex(`spec:status:${runId}`, 3600, JSON.stringify({
      status: "queued",
      message: "Spec generation task is queued...",
      timestamp: Date.now()
    }));

    // Push the job payload to the Redis queue for the FastAPI worker
    await redis.lpush("spec:queue", JSON.stringify({
      runId,
      roomId,
      projectId,
      userId: session.user.id,
      chatHistory: chatHistory || [],
      nodes: nodes || [],
      edges: edges || []
    }));

    return NextResponse.json({ success: true, runId });
  } catch (error: any) {
    console.error("Failed to trigger spec generation:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
