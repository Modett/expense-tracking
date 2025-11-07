import { z } from "zod";

const tagTypeEnum = z.enum(["collection", "campaign", "custom", "department"]);

export const updateTagParamsSchema = z.object({
  id: z.string().uuid(),
});

export const updateTagBodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  type: tagTypeEnum,
});

export type UpdateTagParams = z.infer<typeof updateTagParamsSchema>;
export type UpdateTagBody = z.infer<typeof updateTagBodySchema>;
