import { z } from "zod";

// Validator for expense ID parameter in URL paths
export const expenseIdParamValidator = z.object({
  expenseId: z.string().uuid("Invalid expense ID format"),
});

export type ExpenseIdParamDto = z.infer<typeof expenseIdParamValidator>;
