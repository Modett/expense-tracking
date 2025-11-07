import { z } from "zod";

export const getExpensesByTagsQuerySchema = z.object({
  tagIds: z.string().transform((val) => val.split(",")),
  mode: z.enum(["all", "any"]).default("any"),
});

export type GetExpensesByTagsQuery = z.infer<typeof getExpensesByTagsQuerySchema>;
