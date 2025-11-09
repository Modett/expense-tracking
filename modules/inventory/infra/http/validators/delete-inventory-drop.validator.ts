import { z } from "zod";

export const deleteInventoryDropParamsSchema = z.object({
  id: z.string().uuid("Inventory drop ID must be a valid UUID"),
});

export type DeleteInventoryDropParams = z.infer<typeof deleteInventoryDropParamsSchema>;
