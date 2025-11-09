import { z } from "zod";

export const getApprovalRulesByCategoryParamsSchema = z.object({
  categoryId: z.string().uuid(),
});

export type GetApprovalRulesByCategoryParams = z.infer<typeof getApprovalRulesByCategoryParamsSchema>;
