import * as z from "zod";

export const sendMessageSchema = z.object({
  to: z.string().regex(/^\w{24}$/, { error: `Invalid id format` }),
  jobId: z.string().regex(/^\w{24}$/, { error: `Invalid id format` }),
  message: z.string().min(1).trim().max(10000),
});

export const getChatHistorySchema = z.object({
  partner: z.string().regex(/^\w{24}$/, { error: `Invalid id format` }),
});
