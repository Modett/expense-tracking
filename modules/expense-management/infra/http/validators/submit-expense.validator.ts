import { z } from "zod";

// Validator for submitting expense
export const submitExpenseValidator = z.object({
  params: z.object({
    expenseId: z.string().uuid("Invalid expense ID format"),
  }),
  body: z.object({
    comment: z.string().optional(),
  }),
});

export type SubmitExpenseDto = z.infer<typeof submitExpenseValidator>;
