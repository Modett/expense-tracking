import { z } from "zod";

export const updatePurchaseOrderParamsSchema = z.object({
  id: z.string().uuid("Purchase order ID must be a valid UUID"),
});

export const updatePurchaseOrderBodySchema = z.object({
  totalValue: z.number().nonnegative("Total value must be non-negative").optional(),
  description: z.string().optional(),
});

export type UpdatePurchaseOrderParams = z.infer<typeof updatePurchaseOrderParamsSchema>;
export type UpdatePurchaseOrderBody = z.infer<typeof updatePurchaseOrderBodySchema>;
