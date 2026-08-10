import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Validates the session and checks if the user has access to a given project.
 * Returns the session user and the project if authorized, or nulls if not.
 */
export async function getProjectAccess(projectId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { user: null, project: null, error: "UNAUTHORIZED" };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: true,
    }
  });

  if (!project) {
    return { user: session.user, project: null, error: "NOT_FOUND" };
  }

  const isOwner = project.ownerId === session.user.id;
  const isCollaborator = project.collaborators.some(c => c.email === session.user.email);

  if (!isOwner && !isCollaborator) {
    return { user: session.user, project: null, error: "FORBIDDEN" };
  }

  return { user: session.user, project, error: null };
}
