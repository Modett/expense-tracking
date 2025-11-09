import { z } from "zod";

export const activateApprovalRuleParamsSchema = z.object({
  id: z.string().uuid(),
});

export type ActivateApprovalRuleParams = z.infer<typeof activateApprovalRuleParamsSchema>;
