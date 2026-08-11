import { z } from "zod";

export const AiStatusSchema = z.enum([
  "queued",
  "processing",
  "generating",
  "applying",
  "complete",
  "error"
]);

export type AiStatus = z.infer<typeof AiStatusSchema>;

export const AiStatusFeedPayloadSchema = z.object({
  type: z.literal("ai-status-feed"),
  status: AiStatusSchema,
  message: z.string(),
  runId: z.string().nullable(),
  text: z.string().nullable(),
});

export type AiStatusFeedPayload = z.infer<typeof AiStatusFeedPayloadSchema>;

export const AiChatRoleSchema = z.enum(["user", "assistant", "system"]);

export type AiChatRole = z.infer<typeof AiChatRoleSchema>;

export const AiChatFeedPayloadSchema = z.object({
  type: z.literal("ai-chat"),
  sender: z.string(),
  role: AiChatRoleSchema,
  content: z.string(),
  timestamp: z.string(), // ISO date string
});

export type AiChatFeedPayload = z.infer<typeof AiChatFeedPayloadSchema>;
