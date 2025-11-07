import { z } from "zod";

export const getExpenseTagsParamsSchema = z.object({
  expenseId: z.string().uuid(),
});

export type GetExpenseTagsParams = z.infer<typeof getExpenseTagsParamsSchema>;
