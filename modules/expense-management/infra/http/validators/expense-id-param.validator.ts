import { z } from "zod";

export const expenseIdParamSchema = z.object({
  expenseId: z.string().uuid(),
});

export type ExpenseIdParam = z.infer<typeof expenseIdParamSchema>;
