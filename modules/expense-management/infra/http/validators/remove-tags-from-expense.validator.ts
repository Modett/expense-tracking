import { z } from "zod";

export const removeTagsFromExpenseParamsSchema = z.object({
  expenseId: z.string().uuid(),
});

export const removeTagsFromExpenseBodySchema = z.object({
  tagIds: z.array(z.string().uuid()).min(1),
});

export type RemoveTagsFromExpenseParams = z.infer<typeof removeTagsFromExpenseParamsSchema>;
export type RemoveTagsFromExpenseBody = z.infer<typeof removeTagsFromExpenseBodySchema>;
