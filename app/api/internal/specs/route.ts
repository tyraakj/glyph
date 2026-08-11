import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    // Basic security: require a secret token from the python worker
    const authHeader = request.headers.get("authorization");
    const secret = process.env.LIVEBLOCKS_SECRET_KEY || "dev-secret"; // We can reuse a secret, or just a generic internal secret
    
    // For now, let's just do a basic check
    if (authHeader !== `Bearer ${secret}`) {
       // Allow if no secret is strict locally, but in prod we'd want this
       if (process.env.NODE_ENV === "production") {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       }
    }

    const body = await request.json();
    const { projectId, content, filename } = body;
    
    if (!projectId || !content || !filename) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Upload to Vercel Blob
    const blobName = `projects/${projectId}/specs/${filename}`;
    const blob = await put(blobName, content, {
      contentType: 'text/markdown',
      addRandomSuffix: true
    });

    // Save to Prisma
    const spec = await prisma.projectSpec.create({
      data: {
        projectId,
        filePath: blob.url,
        filename,
      }
    });

    return NextResponse.json({ success: true, spec });
  } catch (error) {
    console.error("Failed to save spec:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
