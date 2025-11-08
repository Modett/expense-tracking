import { z } from "zod";

export const updateApprovalParamsSchema = z.object({
  approvalId: z.string().uuid(),
});

export const updateApprovalBodySchema = z.object({
  comments: z.string().max(1000),
});

export type UpdateApprovalParams = z.infer<typeof updateApprovalParamsSchema>;
export type UpdateApprovalBody = z.infer<typeof updateApprovalBodySchema>;
