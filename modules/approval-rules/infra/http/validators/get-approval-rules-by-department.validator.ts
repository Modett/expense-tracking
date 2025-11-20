import { z } from "zod";

export const getApprovalRulesByDepartmentParamsSchema = z.object({
  departmentId: z.string().uuid(),
});

export type GetApprovalRulesByDepartmentParams = z.infer<typeof getApprovalRulesByDepartmentParamsSchema>;
