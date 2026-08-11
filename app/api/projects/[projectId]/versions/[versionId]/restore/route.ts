import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(
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

    // Fetch version to restore
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
    const jsonString = JSON.stringify(canvasData);

    // Re-upload as a new Blob
    const timestamp = Date.now();
    const blobName = `projects/${projectId}/versions/${timestamp}.json`;
    const blob = await put(blobName, jsonString, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: true
    });

    // Create a new version record for the restoration
    await prisma.$transaction([
      prisma.canvasVersion.create({
        data: {
          projectId,
          userId: session.user.id,
          userName: session.user.name || "Unknown User",
          userImage: session.user.image,
          blobUrl: blob.url,
          nodeCount: version.nodeCount,
          edgeCount: version.edgeCount,
          source: "restore",
          label: `Restored from ${new Date(version.createdAt).toLocaleString()}`
        }
      }),
      prisma.project.update({
        where: { id: projectId },
        data: { canvasJsonPath: blob.url },
      })
    ]);

    return NextResponse.json({ success: true, canvas: canvasData });
  } catch (error) {
    console.error("Failed to restore version:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
