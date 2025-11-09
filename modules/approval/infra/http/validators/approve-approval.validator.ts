import { z } from "zod";

export const approveApprovalParamsSchema = z.object({
  approvalId: z.string().uuid(),
});

export const approveApprovalBodySchema = z.object({
  comments: z.string().max(1000).optional(),
});

export type ApproveApprovalParams = z.infer<typeof approveApprovalParamsSchema>;
export type ApproveApprovalBody = z.infer<typeof approveApprovalBodySchema>;
