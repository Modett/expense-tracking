import { z } from "zod";

// Validator for getting expenses by status
export const getExpensesByStatusValidator = z.object({
  query: z.object({
    status: z.enum(["draft", "submitted", "approved", "rejected", "cancelled"]),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10)),
    userId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export type GetExpensesByStatusDto = z.infer<
  typeof getExpensesByStatusValidator
>;
