import { z } from "zod";

export const getCategoryByIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type GetCategoryByIdParams = z.infer<typeof getCategoryByIdParamsSchema>;
