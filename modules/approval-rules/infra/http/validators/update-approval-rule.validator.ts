import { z } from "zod";

export const updateApprovalRuleParamsSchema = z.object({
  id: z.string().uuid(),
});

export const updateApprovalRuleBodySchema = z.object({
  minAmount: z.number().nonnegative().optional(),
  approverRole: z.enum(["staff", "manager", "finance", "admin"]).optional(),
  approvalOrder: z.number().int().positive().optional(),
});

export type UpdateApprovalRuleParams = z.infer<typeof updateApprovalRuleParamsSchema>;
export type UpdateApprovalRuleBody = z.infer<typeof updateApprovalRuleBodySchema>;
