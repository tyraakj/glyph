import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ projectId: string; versionId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, versionId } = await props.params;

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

    // Fetch version
    const version = await prisma.canvasVersion.findUnique({
      where: { id: versionId }
    });

    if (!version || version.projectId !== projectId) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Fetch canvas JSON from Blob
    const response = await fetch(version.blobUrl);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch canvas data from storage" }, { status: 500 });
    }
    
    const canvasData = await response.json();

    return NextResponse.json({ 
      version: {
        id: version.id,
        userId: version.userId,
        userName: version.userName,
        userImage: version.userImage,
        nodeCount: version.nodeCount,
        edgeCount: version.edgeCount,
        source: version.source,
        label: version.label,
        createdAt: version.createdAt,
      },
      canvas: canvasData 
    });
  } catch (error) {
    console.error("Failed to fetch version details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
