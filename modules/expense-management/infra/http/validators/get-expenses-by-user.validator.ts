import { z } from "zod";

// Validator for getting expenses by user
export const getExpensesByUserValidator = z.object({
  params: z.object({
    userId: z.string().uuid("Invalid user ID format"),
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10)),
    status: z
      .enum(["draft", "submitted", "approved", "rejected", "cancelled"])
      .optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export type GetExpensesByUserDto = z.infer<typeof getExpensesByUserValidator>;
