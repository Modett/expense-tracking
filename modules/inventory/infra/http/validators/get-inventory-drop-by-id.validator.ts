import { z } from "zod";

export const getInventoryDropByIdParamsSchema = z.object({
  id: z.string().uuid("Inventory drop ID must be a valid UUID"),
});

export type GetInventoryDropByIdParams = z.infer<typeof getInventoryDropByIdParamsSchema>;
