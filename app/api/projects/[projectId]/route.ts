import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to modify a project." },
        { status: 401 }
      );
    }

    const { projectId } = await params;

    // Validate the request body for 'name'
    let name: string;
    try {
      const body = await req.json();
      if (!body || typeof body.name !== "string" || body.name.trim().length === 0) {
        return NextResponse.json(
          { error: "A valid project name is required." },
          { status: 400 }
        );
      }
      name = body.name.trim();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body provided." },
        { status: 400 }
      );
    }

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    if (project.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have permission to rename this project." },
        { status: 403 }
      );
    }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { name },
    });

    return NextResponse.json(updatedProject);
  } catch (error: any) {
    console.error(`PATCH /api/projects/[projectId] error:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to rename project." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to delete a project." },
        { status: 401 }
      );
    }

    const { projectId } = await params;

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    if (project.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have permission to delete this project." },
        { status: 403 }
      );
    }

    // Delete the project
    await prisma.project.delete({
      where: { id: projectId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error(`DELETE /api/projects/[projectId] error:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete project." },
      { status: 500 }
    );
  }
}
