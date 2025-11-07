import { z } from "zod";

// Validator for removing expense tag
export const removeExpenseTagValidator = z.object({
  params: z.object({
    expenseId: z.string().uuid("Invalid expense ID format"),
    tagId: z.string().uuid("Invalid tag ID format"),
  }),
});

export type RemoveExpenseTagDto = z.infer<typeof removeExpenseTagValidator>;
