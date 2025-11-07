import { z } from "zod";

// Validator for getting expense tags
export const getExpenseTagsValidator = z.object({
  params: z.object({
    expenseId: z.string().uuid("Invalid expense ID format"),
  }),
});

export type GetExpenseTagsDto = z.infer<typeof getExpenseTagsValidator>;
