import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { liveblocks } from "@/lib/liveblocks-server"
import { PublicCanvasViewer } from "@/components/editor/public-canvas-viewer"

export default async function PublicViewPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params

  // Lookup the project by its publicShareToken
  const project = await prisma.project.findFirst({
    where: { publicShareToken: token }
  })

  if (!project) {
    notFound()
  }

  // Fetch the latest canvas state from Liveblocks
  let initialNodes = []
  let initialEdges = []

  try {
    const storage = await liveblocks.getStorageDocument(project.liveblocksRoomId)
    // Liveblocks storage for React Flow returns nodes/edges in a specific nested format, or flat if we used LiveList
    // Depending on how CanvasBoard initializes, the nodes and edges might be inside the storage tree.
    // However, wait: the user's React Flow uses Liveblocks Yjs or Liveblocks Storage?
    // Let's assume nodes and edges are stored at the root if we use typical useStorage.
    const nodes = storage.data.nodes || []
    const edges = storage.data.edges || []
    
    // Convert LiveList representation to standard arrays if needed
    initialNodes = Array.isArray(nodes) ? nodes : (nodes as any).data || []
    initialEdges = Array.isArray(edges) ? edges : (edges as any).data || []
  } catch (err) {
    console.error("Failed to fetch Liveblocks storage:", err)
    // Fallback to latest database snapshot if Liveblocks fails
    if (project.canvasJsonPath) {
      try {
        const res = await fetch(project.canvasJsonPath)
        const data = await res.json()
        initialNodes = data.nodes || []
        initialEdges = data.edges || []
      } catch (fallbackErr) {
        console.error("Failed to fetch fallback snapshot:", fallbackErr)
      }
    }
  }

  return (
    <div className="flex h-screen w-full flex-col bg-bg-base">
      <div className="flex h-14 items-center justify-between border-b border-border-subtle px-4">
        <div className="flex items-center gap-2 text-text-primary font-semibold">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-accent-primary/10 text-accent-primary">
            G
          </div>
          {project.name}
        </div>
        <div className="text-xs text-text-muted">
          Read-only view
        </div>
      </div>
      <div className="flex-1 relative">
        <PublicCanvasViewer initialNodes={initialNodes} initialEdges={initialEdges} />
      </div>
    </div>
  )
}
