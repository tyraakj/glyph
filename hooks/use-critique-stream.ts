import { useState, useEffect } from "react";

type CritiqueStatus = "idle" | "queued" | "processing" | "generating" | "saving" | "complete" | "error";

interface CritiqueFinding {
  severity: "error" | "warning" | "info";
  nodeId: string;
  title: string;
  description: string;
  suggestion: string;
}

export function useCritiqueStream(runId: string | null) {
  const [status, setStatus] = useState<CritiqueStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [findings, setFindings] = useState<CritiqueFinding[]>([]);
  const [summary, setSummary] = useState<string>("");

  useEffect(() => {
    if (!runId) {
      setStatus("idle");
      setMessage("");
      setFindings([]);
      setSummary("");
      return;
    }

    const eventSource = new EventSource(`/api/ai/critique/stream/${runId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setStatus(data.status);
        setMessage(data.message || "");
        if (data.findings) setFindings(data.findings);
        if (data.summary) setSummary(data.summary);

        if (data.status === "complete" || data.status === "error") {
          eventSource.close();
        }
      } catch (err) {
        console.error("Failed to parse SSE message", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error", error);
      setStatus("error");
      setMessage("Stream connection lost");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [runId]);

  return {
    status,
    message,
    findings,
    summary,
    isRunning: ["queued", "processing", "generating", "saving"].includes(status),
  };
}
