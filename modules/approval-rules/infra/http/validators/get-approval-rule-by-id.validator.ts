import { z } from "zod";

export const getApprovalRuleByIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type GetApprovalRuleByIdParams = z.infer<typeof getApprovalRuleByIdParamsSchema>;
