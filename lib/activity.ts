import { prisma } from "./prisma";

export async function logActivity({
  projectId,
  userId,
  action,
  details = null,
}: {
  projectId: string;
  userId: string;
  action: string;
  details?: string | null;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        projectId,
        userId,
        action,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // We don't want activity logging failures to break the main app flow
  }
}
