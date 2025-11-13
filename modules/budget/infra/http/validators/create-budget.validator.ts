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
  enforcementType: z.enum(["soft", "hard"]).optional().default("soft"),
  overrideAllowed: z.boolean().optional().default(true),
  warningThreshold1: z.number().min(0).max(100).optional().default(80),
  warningThreshold2: z.number().min(0).max(100).optional().default(90),
  criticalThreshold: z.number().min(0).max(100).optional().default(100),
});

export type CreateBudgetBody = z.infer<typeof createBudgetBodySchema>;
