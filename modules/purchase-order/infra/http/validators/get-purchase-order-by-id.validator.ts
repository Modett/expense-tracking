import { z } from "zod";

export const getPurchaseOrderByIdParamsSchema = z.object({
  id: z.string().uuid("Purchase order ID must be a valid UUID"),
});

export type GetPurchaseOrderByIdParams = z.infer<typeof getPurchaseOrderByIdParamsSchema>;
