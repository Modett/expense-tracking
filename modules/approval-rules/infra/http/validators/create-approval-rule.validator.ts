import { z } from "zod";

export const createApprovalRuleBodySchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  minAmount: z.number().nonnegative(),
  approverRole: z.enum(["staff", "manager", "finance", "admin"]),
  approvalOrder: z.number().int().positive(),
}).refine(
  (data) => data.categoryId || data.departmentId,
  {
    message: "Either categoryId or departmentId must be provided",
    path: ["categoryId"],
  }
);

export type CreateApprovalRuleBody = z.infer<typeof createApprovalRuleBodySchema>;
