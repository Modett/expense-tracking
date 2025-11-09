import { z } from "zod";

export const deletePurchaseOrderParamsSchema = z.object({
  id: z.string().uuid("Purchase order ID must be a valid UUID"),
});

export type DeletePurchaseOrderParams = z.infer<typeof deletePurchaseOrderParamsSchema>;
