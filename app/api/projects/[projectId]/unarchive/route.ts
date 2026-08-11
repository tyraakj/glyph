import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to unarchive a project." },
        { status: 401 }
      );
    }

    const { projectId } = await props.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (project.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have permission to unarchive this project." },
        { status: 403 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { archivedAt: null },
    });

    return NextResponse.json(updatedProject);
  } catch (error: any) {
    console.error("PATCH /api/projects/[projectId]/unarchive error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to unarchive project." },
      { status: 500 }
    );
  }
}
