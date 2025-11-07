import { z } from "zod";

export const removeTagFromExpenseParamsSchema = z.object({
  expenseId: z.string().uuid(),
  tagId: z.string().uuid(),
});

export type RemoveTagFromExpenseParams = z.infer<typeof removeTagFromExpenseParamsSchema>;
