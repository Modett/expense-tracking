import { z } from "zod";

export const rejectExpenseParamsSchema = z.object({
  expenseId: z.string().uuid(),
});

export const rejectExpenseBodySchema = z.object({
  rejectionReason: z.string().min(1).max(500),
});

export type RejectExpenseParams = z.infer<typeof rejectExpenseParamsSchema>;
export type RejectExpenseBody = z.infer<typeof rejectExpenseBodySchema>;
