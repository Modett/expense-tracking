import { z } from "zod";

export const getAllApprovalRulesQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  approverRole: z.enum(["staff", "manager", "finance", "admin"]).optional(),
  isActive: z.string().transform((val) => val === "true").optional(),
  minAmountGreaterThan: z.string().transform((val) => parseFloat(val)).optional(),
  minAmountLessThan: z.string().transform((val) => parseFloat(val)).optional(),
});

export type GetAllApprovalRulesQuery = z.infer<typeof getAllApprovalRulesQuerySchema>;
