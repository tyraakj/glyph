export type AiStatus = 
  | "queued"
  | "processing"
  | "generating"
  | "applying"
  | "complete"
  | "error";

export type AiStatusFeedPayload = {
  type: "ai-status-feed";
  status: AiStatus;
  message: string;
  runId: string | null;
  text: string | null;
};
