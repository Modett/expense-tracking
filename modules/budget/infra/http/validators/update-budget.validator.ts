import { z } from "zod";

export const updateBudgetParamsSchema = z.object({
  budgetId: z.string().uuid(),
});

export const updateBudgetBodySchema = z.object({
  budgetAmount: z.number().positive(),
});

export type UpdateBudgetParams = z.infer<typeof updateBudgetParamsSchema>;
export type UpdateBudgetBody = z.infer<typeof updateBudgetBodySchema>;
