import { z } from "zod";

export const getExpensesByTagParamsSchema = z.object({
  tagId: z.string().uuid(),
});

export type GetExpensesByTagParams = z.infer<typeof getExpensesByTagParamsSchema>;
