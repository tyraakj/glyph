import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await props.params;
    const body = await request.json();
    const enable = body.enable === true;

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate or clear token
    let token = null;
    if (enable) {
      // Use crypto.randomUUID or simple random string for token
      token = crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36);
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { publicShareToken: token }
    });

    return NextResponse.json({ success: true, token: updated.publicShareToken });
  } catch (error) {
    console.error("Failed to update share settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
