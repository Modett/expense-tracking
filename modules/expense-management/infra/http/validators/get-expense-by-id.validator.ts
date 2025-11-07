import { z } from "zod";

// Validator for getting expense by ID
export const getExpenseByIdValidator = z.object({
  params: z.object({
    expenseId: z.string().uuid("Invalid expense ID format"),
  }),
});

export type GetExpenseByIdDto = z.infer<typeof getExpenseByIdValidator>;
