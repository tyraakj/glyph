import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function PUT(
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

    const body = await request.json();
    
    // Validate we have nodes and edges
    if (!body || !Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
      return NextResponse.json({ error: "Invalid canvas payload" }, { status: 400 });
    }

    // Convert payload to string for blob upload
    const jsonString = JSON.stringify(body);
    
    // Upload to Vercel Blob
    const blobName = `projects/${projectId}/canvas.json`;
    const blob = await put(blobName, jsonString, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: true // Prevents caching issues if we want new URLs, though overwriting is also fine
    });

    // Save blob URL to project
    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: blob.url },
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error("Canvas save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    if (!project.canvasJsonPath) {
      // It's perfectly fine for a project to not have a saved canvas yet
      return NextResponse.json({ nodes: [], edges: [] });
    }

    // Fetch the JSON from the public blob URL
    const response = await fetch(project.canvasJsonPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob from ${project.canvasJsonPath}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Canvas load error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
