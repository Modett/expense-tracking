import { z } from "zod";

export const removeTagFromExpensesBodySchema = z.object({
  expenseIds: z.array(z.string().uuid()).min(1),
  tagId: z.string().uuid(),
});

export type RemoveTagFromExpensesBody = z.infer<typeof removeTagFromExpensesBodySchema>;
