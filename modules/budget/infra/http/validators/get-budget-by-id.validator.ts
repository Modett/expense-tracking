import { z } from "zod";

export const getBudgetByIdParamsSchema = z.object({
  budgetId: z.string().uuid(),
});

export type GetBudgetByIdParams = z.infer<typeof getBudgetByIdParamsSchema>;
