import { z } from "zod";

export const updateExpenseParamsSchema = z.object({
  expenseId: z.string().uuid(),
});

export const updateExpenseBodySchema = z.object({
  vendorId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  description: z.string().min(1).max(1000).optional(),
  netAmount: z.number().positive().optional(),
  taxAmount: z.number().min(0).optional(),
  totalAmount: z.number().positive().optional(),
  expenseDate: z.string().datetime().optional(),
  receiptUrl: z.string().url().optional(),
});

export type UpdateExpenseParams = z.infer<typeof updateExpenseParamsSchema>;
export type UpdateExpenseBody = z.infer<typeof updateExpenseBodySchema>;
