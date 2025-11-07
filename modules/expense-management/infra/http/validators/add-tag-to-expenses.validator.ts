import { z } from "zod";

export const addTagToExpensesBodySchema = z.object({
  expenseIds: z.array(z.string().uuid()).min(1),
  tagId: z.string().uuid(),
});

export type AddTagToExpensesBody = z.infer<typeof addTagToExpensesBodySchema>;
