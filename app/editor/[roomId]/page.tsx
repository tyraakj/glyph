import { getProjectAccess } from "@/lib/project-access";
import { AccessDenied } from "@/components/editor/access-denied";
import { redirect } from "next/navigation";

interface WorkspacePageProps {
  params: Promise<{
    roomId: string;
  }>
}

export default async function WorkspacePage(props: WorkspacePageProps) {
  const { roomId } = await props.params;

  // The roomId is in the format `[id]-[slug]`. We extract the id.
  const idMatch = roomId.match(/^([^-]+)-/);
  const projectId = idMatch ? idMatch[1] : roomId;

  const { user, project, error } = await getProjectAccess(projectId);

  if (!user) {
    redirect("/sign-in");
  }

  if (error || !project) {
    return <AccessDenied />;
  }

  return (
    <div className="flex h-full w-full bg-bg-base relative overflow-hidden">
      {/* Central Canvas Placeholder */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="absolute inset-0 pattern-dots text-border-subtle opacity-50" />
        <div className="relative z-10 text-center space-y-2 p-6 rounded-2xl bg-bg-elevated/80 backdrop-blur-md border border-border-default shadow-xl">
          <h2 className="text-xl font-semibold text-text-primary">
            {project.name} Workspace
          </h2>
          <p className="text-sm text-text-secondary max-w-sm">
            The interactive canvas engine will be mounted here in a future update.
          </p>
        </div>
      </div>

      {/* Right AI Sidebar Placeholder */}
      <div className="w-80 h-full border-l border-border-subtle bg-bg-surface hidden lg:flex flex-col">
        <div className="flex h-14 items-center px-4 border-b border-border-subtle">
          <span className="text-sm font-semibold text-text-primary">AI Assistant</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-text-muted text-center">
            AI Chat will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}
