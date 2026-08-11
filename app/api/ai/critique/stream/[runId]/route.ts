import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;

  // 1. Authenticate user
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Verify they own the task run
  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
  });

  if (!taskRun || taskRun.userId !== session.user.id) {
    return new Response("Forbidden or Not Found", { status: 403 });
  }

  // 3. Set up SSE headers
  const responseHeaders = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
  });

  // 4. Create a ReadableStream that polls Upstash Redis
  const stream = new ReadableStream({
    async start(controller) {
      let isStreamClosed = false;

      // Handle client disconnects
      request.signal.addEventListener("abort", () => {
        isStreamClosed = true;
      });

      const sendEvent = (data: any) => {
        if (!isStreamClosed) {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
        }
      };

      try {
        let lastStatusStr = "";

        // Poll every 1 second
        while (!isStreamClosed) {
          const statusObj = await redis.get<any>(`critique:status:${runId}`);
          
          if (statusObj) {
            // Stringify to compare easily
            const currentStatusStr = JSON.stringify(statusObj);

            if (currentStatusStr !== lastStatusStr) {
              sendEvent(statusObj);
              lastStatusStr = currentStatusStr;

              // If terminal state, close the stream
              if (statusObj.status === "complete" || statusObj.status === "error") {
                isStreamClosed = true;
                controller.close();
                break;
              }
            }
          }

          // Wait 1 second before polling again
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error("SSE Streaming Error:", error);
        sendEvent({ status: "error", message: "Stream disconnected unexpectedly" });
        if (!isStreamClosed) {
          controller.close();
        }
      }
    },
  });

  return new Response(stream, { headers: responseHeaders });
}
