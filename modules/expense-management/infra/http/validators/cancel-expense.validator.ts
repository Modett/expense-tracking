import { z } from "zod";

// Validator for cancelling expense
export const cancelExpenseValidator = z.object({
  params: z.object({
    expenseId: z.string().uuid("Invalid expense ID format"),
  }),
  body: z.object({
    reason: z.string().min(1, "Cancellation reason is required"),
  }),
});

export type CancelExpenseDto = z.infer<typeof cancelExpenseValidator>;
