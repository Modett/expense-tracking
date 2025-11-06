import { z } from "zod";

export const getAllVendorsQuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
  isActive: z.string().transform((val) => val === "true").optional(),
  searchTerm: z.string().trim().optional(),
});

export type GetAllVendorsQuery = z.infer<typeof getAllVendorsQuerySchema>;
