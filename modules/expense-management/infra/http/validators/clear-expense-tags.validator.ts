import { z } from "zod";

export const clearExpenseTagsParamsSchema = z.object({
  expenseId: z.string().uuid(),
});

export type ClearExpenseTagsParams = z.infer<typeof clearExpenseTagsParamsSchema>;
