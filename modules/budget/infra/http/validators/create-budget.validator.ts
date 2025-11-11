import { z } from "zod";

export const createBudgetBodySchema = z.object({
  departmentId: z.string().uuid(),
  categoryId: z.string().uuid().nullable().optional(), // Optional for department-based budgets
  budgetAmount: z.number().positive(),
  fiscalPeriod: z
    .string()
    .regex(/^(\d{4}|\d{4}-Q[1-4]|\d{4}-H[1-2]|\d{4}-(0[1-9]|1[0-2]))$/),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type CreateBudgetBody = z.infer<typeof createBudgetBodySchema>;
