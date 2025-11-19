import { z } from "zod";

export const updateBudgetParamsSchema = z.object({
  budgetId: z.string().uuid(),
});

export const updateBudgetBodySchema = z.object({
  departmentId: z.string().uuid().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  budgetAmount: z.number().positive().optional(),
  enforcementType: z.enum(["soft", "hard"]).optional(),
  overrideAllowed: z.boolean().optional(),
  warningThreshold1: z.number().min(0).max(100).optional(),
  warningThreshold2: z.number().min(0).max(100).optional(),
  criticalThreshold: z.number().min(0).max(100).optional(),
});

export type UpdateBudgetParams = z.infer<typeof updateBudgetParamsSchema>;
export type UpdateBudgetBody = z.infer<typeof updateBudgetBodySchema>;
