import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ roomId: string; specId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, specId } = await props.params;
    
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

    // Verify spec belongs to project
    const spec = await prisma.projectSpec.findUnique({
      where: { id: specId }
    });

    if (!spec || spec.projectId !== projectId) {
      return NextResponse.json({ error: "Spec not found" }, { status: 404 });
    }

    // Fetch the raw markdown content from the blob URL
    const response = await fetch(spec.filePath);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to read spec file from storage" }, { status: 500 });
    }

    const content = await response.text();

    // Check if it's a direct download vs preview (frontend can pass ?preview=true)
    const isPreview = request.nextUrl.searchParams.get("preview") === "true";

    // Return the file with proper headers
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": isPreview ? "inline" : `attachment; filename="${spec.filename}"`
      }
    });

  } catch (error) {
    console.error("Failed to download spec:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
