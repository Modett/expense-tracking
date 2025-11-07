import { z } from "zod";

export const addTagToExpenseParamsSchema = z.object({
  expenseId: z.string().uuid(),
});

export const addTagToExpenseBodySchema = z.object({
  tagId: z.string().uuid(),
});

export type AddTagToExpenseParams = z.infer<typeof addTagToExpenseParamsSchema>;
export type AddTagToExpenseBody = z.infer<typeof addTagToExpenseBodySchema>;
