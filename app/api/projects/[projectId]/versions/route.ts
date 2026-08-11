import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await props.params;

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

    // Pagination
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const cursor = url.searchParams.get("cursor");

    const versions = await prisma.canvasVersion.findMany({
      where: { projectId },
      take: limit + 1, // Fetch one extra to determine if there are more
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        userName: true,
        userImage: true,
        nodeCount: true,
        edgeCount: true,
        source: true,
        label: true,
        createdAt: true,
      } // Exclude blobUrl for list view
    });

    let nextCursor = null;
    if (versions.length > limit) {
      const nextItem = versions.pop();
      if (nextItem) {
        nextCursor = nextItem.id;
      }
    }

    return NextResponse.json({ versions, nextCursor });
  } catch (error) {
    console.error("Failed to fetch versions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
