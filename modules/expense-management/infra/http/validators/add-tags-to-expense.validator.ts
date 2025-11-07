import { z } from "zod";

export const addTagsToExpenseParamsSchema = z.object({
  expenseId: z.string().uuid(),
});

export const addTagsToExpenseBodySchema = z.object({
  tagIds: z.array(z.string().uuid()).min(1),
});

export type AddTagsToExpenseParams = z.infer<typeof addTagsToExpenseParamsSchema>;
export type AddTagsToExpenseBody = z.infer<typeof addTagsToExpenseBodySchema>;
