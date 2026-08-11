import { useState, useEffect } from "react";
import type { AiStatus } from "@/types/tasks";

interface StreamState {
  status: AiStatus | null;
  message: string | null;
  isRunning: boolean;
}

export function useDesignStream(runId: string | null) {
  const [state, setState] = useState<StreamState>({
    status: null,
    message: null,
    isRunning: false,
  });

  useEffect(() => {
    if (!runId) {
      setState({ status: null, message: null, isRunning: false });
      return;
    }

    setState({ status: "queued", message: "Connecting...", isRunning: true });

    const eventSource = new EventSource(`/api/ai/design/stream/${runId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        setState((prev) => ({
          ...prev,
          status: data.status,
          message: data.message,
          isRunning: data.status !== "complete" && data.status !== "error",
        }));

        if (data.status === "complete" || data.status === "error") {
          eventSource.close();
        }
      } catch (err) {
        console.error("Failed to parse SSE message", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      setState({
        status: "error",
        message: "Lost connection to the design agent.",
        isRunning: false,
      });
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [runId]);

  return state;
}
