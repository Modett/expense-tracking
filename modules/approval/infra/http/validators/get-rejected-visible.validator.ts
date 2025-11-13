import { z } from "zod";

export const getRejectedVisibleQuerySchema = z.object({
  departmentId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  rejectedByRole: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

export type GetRejectedVisibleQuery = z.infer<
  typeof getRejectedVisibleQuerySchema
>;
