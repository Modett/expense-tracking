import { z } from "zod";

export const updateCategoryParamsSchema = z.object({
  id: z.string().uuid(),
});

export const updateCategoryBodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
});

export type UpdateCategoryParams = z.infer<typeof updateCategoryParamsSchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>;
