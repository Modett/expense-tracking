import { z } from "zod";

export const getAllApprovalsQuerySchema = z.object({
  expenseId: z.string().uuid().optional(),
  approverId: z.string().uuid().optional(),
  status: z.enum(["pending", "approved", "rejected", "skipped"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type GetAllApprovalsQuery = z.infer<typeof getAllApprovalsQuerySchema>;
