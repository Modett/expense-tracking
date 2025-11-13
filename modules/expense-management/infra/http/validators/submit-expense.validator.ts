import { z } from "zod";

export const submitExpenseBodySchema = z.object({
  budgetOverride: z
    .enum(["none", "emergency", "annual", "recurring"])
    .optional(),
  justification: z.string().min(50).max(2000).optional().nullable(),
});

export type SubmitExpenseBody = z.infer<typeof submitExpenseBodySchema>;
