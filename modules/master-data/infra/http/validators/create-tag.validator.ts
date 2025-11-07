import { z } from "zod";

const tagTypeEnum = z.enum(["collection", "campaign", "custom", "department"]);

export const createTagBodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  type: tagTypeEnum,
});

export type CreateTagBody = z.infer<typeof createTagBodySchema>;
