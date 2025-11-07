import { z } from "zod";

// Validator for deleting expense
export const deleteExpenseValidator = z.object({
  params: z.object({
    expenseId: z.string().uuid("Invalid expense ID format"),
  }),
});

export type DeleteExpenseDto = z.infer<typeof deleteExpenseValidator>;
