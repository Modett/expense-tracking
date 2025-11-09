import { z } from "zod";

export const getInventoryDropByDropNumberParamsSchema = z.object({
  dropNumber: z.string().min(1, "Drop number is required"),
});

export type GetInventoryDropByDropNumberParams = z.infer<typeof getInventoryDropByDropNumberParamsSchema>;
