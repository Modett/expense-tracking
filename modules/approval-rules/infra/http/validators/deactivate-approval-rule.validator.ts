import { z } from "zod";

export const deactivateApprovalRuleParamsSchema = z.object({
  id: z.string().uuid(),
});

export type DeactivateApprovalRuleParams = z.infer<typeof deactivateApprovalRuleParamsSchema>;
