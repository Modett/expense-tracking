import { z } from "zod";

export const getApprovalByIdParamsSchema = z.object({
  approvalId: z.string().uuid(),
});

export type GetApprovalByIdParams = z.infer<typeof getApprovalByIdParamsSchema>;
