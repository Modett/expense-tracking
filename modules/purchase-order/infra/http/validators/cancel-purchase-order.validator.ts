import { z } from "zod";

export const cancelPurchaseOrderParamsSchema = z.object({
  id: z.string().uuid("Purchase order ID must be a valid UUID"),
});

export type CancelPurchaseOrderParams = z.infer<typeof cancelPurchaseOrderParamsSchema>;
