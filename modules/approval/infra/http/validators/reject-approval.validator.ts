import { z } from "zod";

export const rejectApprovalParamsSchema = z.object({
  approvalId: z.string().uuid(),
});

export const rejectApprovalBodySchema = z.object({
  comments: z.string().max(1000).optional(),
});

export type RejectApprovalParams = z.infer<typeof rejectApprovalParamsSchema>;
export type RejectApprovalBody = z.infer<typeof rejectApprovalBodySchema>;
