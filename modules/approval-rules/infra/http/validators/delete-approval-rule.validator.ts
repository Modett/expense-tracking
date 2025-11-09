import { z } from "zod";

export const deleteApprovalRuleParamsSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteApprovalRuleParams = z.infer<typeof deleteApprovalRuleParamsSchema>;
