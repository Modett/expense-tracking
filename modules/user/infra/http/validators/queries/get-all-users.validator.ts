import { z } from "zod";

export const getAllUsersQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
  role: z.enum(["staff", "manager", "finance", "admin"]).optional(),
  isActive: z.coerce.boolean().optional(),
  searchTerm: z.string().min(1).max(100).optional(),
});

export type GetAllUsersQuery = z.infer<typeof getAllUsersQuerySchema>;
