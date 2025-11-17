import { z } from "zod";

export const createExpenseBodySchema = z.object({
  vendorId: z.string().uuid(),
  categoryId: z.string().uuid(),
  departmentId: z.string().uuid().optional().nullable(),
  description: z.string().min(1).max(1000),
  netAmount: z.number().positive(),
  taxAmount: z.number().min(0),
  totalAmount: z.number().positive(),
  expenseDate: z.string().datetime(),
  receiptUrl: z.string().url().optional().nullable(),
  priority: z
    .enum(["routine", "standard", "urgent", "emergency"])
    .optional()
    .default("standard"),
  budgetOverride: z
    .enum(["none", "emergency", "annual", "recurring"])
    .optional()
    .default("none"),
  justification: z.string().min(10).max(2000).optional().nullable(),
  tagIds: z.array(z.string().uuid()).optional().default([]),
});

export type CreateExpenseBody = z.infer<typeof createExpenseBodySchema>;
