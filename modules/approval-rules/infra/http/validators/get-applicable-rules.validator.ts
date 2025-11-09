import { z } from "zod";

export const getApplicableRulesQuerySchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.string().transform((val) => parseFloat(val)),
});

export type GetApplicableRulesQuery = z.infer<typeof getApplicableRulesQuerySchema>;
