import { z } from "zod"

export const BotDomain = z.enum(["medical", "legal", "receptionist"])
export type BotDomain = z.infer<typeof BotDomain>

export const CreateBotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: BotDomain,
  uid: z.string().optional(),
})

export const UpdateBotSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  domain: BotDomain.optional(),
  uid: z.string().optional(),
})

export const PreCallSchema = z.object({
  // OpenMic webhook format
  event: z.string().optional(),
  call: z.object({
    direction: z.string().optional(),
    from_number: z.string().optional(),
    to_number: z.string().optional(),
    attempt: z.number().optional(),
    bot_id: z.string().optional(),
  }).optional(),
  // Legacy format support
  botUid: z.string().optional(),
  bot_uid: z.string().optional(),
  callId: z.string().optional(),
  call_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
}).transform((data) => ({
  botUid: data.call?.bot_id || data.botUid || data.bot_uid || "unknown",
  callId: data.callId || data.call_id,
  metadata: data.metadata || {},
  event: data.event,
  call: data.call,
}))

export const FetchDetailsSchema = z.object({
  id: z.string(),
  domain: z.string().optional().default("medical"),
})

export const PostCallSchema = z.object({
  // OpenMic webhook format
  type: z.string().optional(),
  sessionId: z.string().optional(),
  toPhoneNumber: z.string().optional(),
  fromPhoneNumber: z.string().optional(),
  callType: z.string().optional(),
  disconnectionReason: z.string().optional(),
  direction: z.string().optional(),
  createdAt: z.string().optional(),
  endedAt: z.string().optional(),
  transcript: z.union([z.string(), z.array(z.any())]).optional(),
  summary: z.string().optional(),
  isSuccessful: z.boolean().optional(),
  // Legacy format support
  botUid: z.string().optional(),
  bot_uid: z.string().optional(),
  callId: z.string().optional(),
  call_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
}).transform((data) => ({
  botUid: data.botUid || data.bot_uid || "unknown",
  callId: data.sessionId || data.callId || data.call_id || "unknown",
  transcript: Array.isArray(data.transcript) 
    ? data.transcript.map(t => Array.isArray(t) ? t.join(': ') : (typeof t === 'string' ? t : JSON.stringify(t))).join('\n')
    : data.transcript || "No transcript available",
  metadata: {
    ...(data.metadata || {}),
    type: data.type,
    sessionId: data.sessionId,
    toPhoneNumber: data.toPhoneNumber,
    fromPhoneNumber: data.fromPhoneNumber,
    callType: data.callType,
    disconnectionReason: data.disconnectionReason,
    direction: data.direction,
    createdAt: data.createdAt,
    endedAt: data.endedAt,
    summary: data.summary,
    isSuccessful: data.isSuccessful,
  },
}))

export type CreateBot = z.infer<typeof CreateBotSchema>
export type UpdateBot = z.infer<typeof UpdateBotSchema>
export type PreCall = z.infer<typeof PreCallSchema>
export type FetchDetails = z.infer<typeof FetchDetailsSchema>
export type PostCall = z.infer<typeof PostCallSchema>

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}
