import { z } from "zod";

const tagTypeEnum = z.enum(["collection", "campaign", "custom", "department"]);

export const getAllTagsQuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
  isActive: z.string().transform((val) => val === "true").optional(),
  type: tagTypeEnum.optional(),
  searchTerm: z.string().trim().optional(),
});

export type GetAllTagsQuery = z.infer<typeof getAllTagsQuerySchema>;
