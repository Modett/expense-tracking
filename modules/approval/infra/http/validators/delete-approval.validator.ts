import { z } from "zod";

export const deleteApprovalParamsSchema = z.object({
  approvalId: z.string().uuid(),
});

export type DeleteApprovalParams = z.infer<typeof deleteApprovalParamsSchema>;
