import { z } from "zod";

export const updateInventoryDropParamsSchema = z.object({
  id: z.string().uuid("Inventory drop ID must be a valid UUID"),
});

export const updateInventoryDropBodySchema = z.object({
  quantity: z.number().nonnegative("Quantity must be non-negative").optional(),
  unitCost: z.number().nonnegative("Unit cost must be non-negative").optional(),
  supplier: z.string().optional(),
  receivedOn: z.coerce.date().optional(),
});

export type UpdateInventoryDropParams = z.infer<typeof updateInventoryDropParamsSchema>;
export type UpdateInventoryDropBody = z.infer<typeof updateInventoryDropBodySchema>;
