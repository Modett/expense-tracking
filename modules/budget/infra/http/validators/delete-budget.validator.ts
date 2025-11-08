import { z } from "zod";

export const deleteBudgetParamsSchema = z.object({
  budgetId: z.string().uuid(),
});

export type DeleteBudgetParams = z.infer<typeof deleteBudgetParamsSchema>;
