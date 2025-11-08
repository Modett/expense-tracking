import { z } from "zod";

export const adjustBudgetSpentParamsSchema = z.object({
  budgetId: z.string().uuid(),
});

export const adjustBudgetSpentBodySchema = z.object({
  amount: z.number().positive(),
  operation: z.enum(["add", "subtract"]),
});

export type AdjustBudgetSpentParams = z.infer<typeof adjustBudgetSpentParamsSchema>;
export type AdjustBudgetSpentBody = z.infer<typeof adjustBudgetSpentBodySchema>;
