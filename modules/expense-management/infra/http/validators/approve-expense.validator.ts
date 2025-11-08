import { z } from "zod";

export const approveExpenseParamsSchema = z.object({
  expenseId: z.string().uuid(),
});

export const approveExpenseBodySchema = z.object({
  approvalNotes: z.string().max(500).optional(),
});

export type ApproveExpenseParams = z.infer<typeof approveExpenseParamsSchema>;
export type ApproveExpenseBody = z.infer<typeof approveExpenseBodySchema>;
