import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, roomId, projectId, apiKey } = body;

    if (!prompt || !roomId || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields (prompt, roomId, projectId)" },
        { status: 400 }
      );
    }

    // Verify project access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { collaborators: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isOwner = project.ownerId === session.user.id;
    const isCollaborator = project.collaborators.some(
      (c) => c.email === session.user.email
    );

    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate a unique run ID
    const runId = crypto.randomUUID();

    // 1. Save the TaskRun to our database for ownership tracking
    await prisma.taskRun.create({
      data: {
        runId,
        projectId,
        userId: session.user.id,
        status: "queued",
      },
    });

    // 2. Set the initial status in Redis (expires in 1 hour so we don't leak memory)
    await redis.setex(`design:status:${runId}`, 3600, JSON.stringify({
      status: "queued",
      message: "Task is queued...",
      timestamp: Date.now()
    }));

    // 3. Push the job payload to the Redis queue for the FastAPI worker
    await redis.lpush("design:queue", JSON.stringify({
      runId,
      prompt,
      roomId,
      projectId,
      userId: session.user.id,
      apiKey
    }));

    return NextResponse.json({ success: true, runId });
  } catch (error: any) {
    console.error("Failed to trigger design agent:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
