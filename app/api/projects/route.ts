import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to view your projects." },
        { status: 401 }
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        ownerId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching your projects." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to create a project." },
        { status: 401 }
      );
    }

    let name = "Untitled Project";
    
    // Parse the body safely since it might be empty
    try {
      const body = await req.json();
      if (body && typeof body.name === "string" && body.name.trim().length > 0) {
        name = body.name.trim();
      }
    } catch {
      // Ignored: body might be empty or not JSON, default name will be used
    }

    const project = await prisma.project.create({
      data: {
        name,
        ownerId: session.user.id,
        status: "DRAFT", // Ensuring default status
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the project." },
      { status: 500 }
    );
  }
}
