import { z } from "zod";

export const issuePurchaseOrderParamsSchema = z.object({
  id: z.string().uuid("Purchase order ID must be a valid UUID"),
});

export type IssuePurchaseOrderParams = z.infer<typeof issuePurchaseOrderParamsSchema>;
