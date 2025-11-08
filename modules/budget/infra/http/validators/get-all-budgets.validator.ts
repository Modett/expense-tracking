import { z } from "zod";

export const getAllBudgetsQuerySchema = z.object({
  departmentId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  fiscalPeriod: z.string().optional(),
  isActive: z.string().transform(val => val === "true").optional(),
  isOverBudget: z.string().transform(val => val === "true").optional(),
  isNearLimit: z.string().transform(val => val === "true").optional(),
});

export type GetAllBudgetsQuery = z.infer<typeof getAllBudgetsQuerySchema>;
