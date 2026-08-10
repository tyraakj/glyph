import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EditorShell } from "@/components/editor/editor-shell";
import { EditorHome } from "@/components/editor/editor-home";

export default async function EditorPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <EditorShell>
      <EditorHome />
    </EditorShell>
  );
}
