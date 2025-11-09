import { z } from "zod";

export const createApprovalRuleBodySchema = z.object({
  categoryId: z.string().uuid(),
  minAmount: z.number().nonnegative(),
  approverRole: z.enum(["staff", "manager", "finance", "admin"]),
  approvalOrder: z.number().int().positive(),
});

export type CreateApprovalRuleBody = z.infer<typeof createApprovalRuleBodySchema>;
