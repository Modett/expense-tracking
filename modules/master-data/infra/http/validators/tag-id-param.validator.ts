import { z } from "zod";

export const tagIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type TagIdParam = z.infer<typeof tagIdParamSchema>;
