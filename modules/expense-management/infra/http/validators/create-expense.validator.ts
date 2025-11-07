import { z } from "zod";

export const createExpenseBodySchema = z.object({
  userId: z.string().uuid(),
  vendorId: z.string().uuid(),
  categoryId: z.string().uuid(),
  departmentId: z.string().uuid(),
  description: z.string().min(1).max(1000),
  netAmount: z.number().positive(),
  taxAmount: z.number().min(0),
  totalAmount: z.number().positive(),
  expenseDate: z.string().datetime(),
  receiptUrl: z.string().url().optional(),
});

export type CreateExpenseBody = z.infer<typeof createExpenseBodySchema>;
