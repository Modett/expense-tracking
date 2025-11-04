import { z } from "zod";

export const categoryIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
