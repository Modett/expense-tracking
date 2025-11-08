import { z } from "zod";

export const createApprovalBodySchema = z.object({
  expenseId: z.string().uuid(),
  approverId: z.string().uuid(),
  comments: z.string().max(1000).optional(),
});

export type CreateApprovalBody = z.infer<typeof createApprovalBodySchema>;
