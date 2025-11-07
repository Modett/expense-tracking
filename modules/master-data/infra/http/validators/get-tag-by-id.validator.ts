import { z } from "zod";

export const getTagByIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type GetTagByIdParams = z.infer<typeof getTagByIdParamsSchema>;
