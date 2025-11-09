import { z } from "zod";

export const receivePurchaseOrderParamsSchema = z.object({
  id: z.string().uuid("Purchase order ID must be a valid UUID"),
});

export const receivePurchaseOrderBodySchema = z.object({
  isPartial: z.boolean().default(false),
});

export type ReceivePurchaseOrderParams = z.infer<typeof receivePurchaseOrderParamsSchema>;
export type ReceivePurchaseOrderBody = z.infer<typeof receivePurchaseOrderBodySchema>;
