import { z } from "zod";

export const closePurchaseOrderParamsSchema = z.object({
  id: z.string().uuid("Purchase order ID must be a valid UUID"),
});

export type ClosePurchaseOrderParams = z.infer<typeof closePurchaseOrderParamsSchema>;
