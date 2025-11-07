import { z } from "zod";

export const replaceExpenseTagsParamsSchema = z.object({
  expenseId: z.string().uuid(),
});

export const replaceExpenseTagsBodySchema = z.object({
  tagIds: z.array(z.string().uuid()),
});

export type ReplaceExpenseTagsParams = z.infer<typeof replaceExpenseTagsParamsSchema>;
export type ReplaceExpenseTagsBody = z.infer<typeof replaceExpenseTagsBodySchema>;
