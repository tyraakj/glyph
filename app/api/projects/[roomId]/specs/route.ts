import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await props.params;
    
    // Extract projectId from roomId (e.g. project1-1234 -> project1)
    const idMatch = roomId.match(/^([^-]+)-/);
    const projectId = idMatch ? idMatch[1] : roomId;

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

    // Fetch specs, omitting the actual filePath to prevent direct blob access if requested
    // but the spec says "do not expose Blob URLs without access checks".
    // We can just exclude the filePath entirely from the client to be safe.
    const specs = await prisma.projectSpec.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ specs });
  } catch (error) {
    console.error("Failed to fetch specs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
