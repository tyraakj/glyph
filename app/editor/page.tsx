import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EditorShell } from "@/components/editor/editor-shell";
import { EditorHome } from "@/components/editor/editor-home";
import { prisma } from "@/lib/prisma";

export default async function EditorPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  const ownedProjects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: 'desc' }
  });

  const sharedProjects = await prisma.project.findMany({
    where: {
      collaborators: {
        some: {
          email: session.user.email
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <EditorShell 
      ownedProjects={ownedProjects} 
      sharedProjects={sharedProjects}
    >
      <EditorHome />
    </EditorShell>
  );
}
