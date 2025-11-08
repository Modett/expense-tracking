import { z } from "zod";

export const getPendingApprovalsQuerySchema = z.object({
  approverId: z.string().uuid().optional(),
});

export type GetPendingApprovalsQuery = z.infer<typeof getPendingApprovalsQuerySchema>;
