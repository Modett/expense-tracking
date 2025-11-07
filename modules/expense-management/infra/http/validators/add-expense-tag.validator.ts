import { z } from "zod";

// Validator for adding expense tag
export const addExpenseTagValidator = z.object({
  params: z.object({
    expenseId: z.string().uuid("Invalid expense ID format"),
  }),
  body: z.object({
    tagId: z.string().uuid("Invalid tag ID format"),
  }),
});

export type AddExpenseTagDto = z.infer<typeof addExpenseTagValidator>;
