import { z } from "zod";

export const getAllExpensesQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  status: z
    .enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "CANCELLED"])
    .optional(),
  priority: z
    .enum(["ROUTINE", "STANDARD", "URGENT", "EMERGENCY"])
    .optional(),
  categoryId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type GetAllExpensesQuery = z.infer<typeof getAllExpensesQuerySchema>;
