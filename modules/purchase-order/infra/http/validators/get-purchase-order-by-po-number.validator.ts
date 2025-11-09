import { z } from "zod";

export const getPurchaseOrderByPONumberParamsSchema = z.object({
  poNumber: z.string().min(1, "PO number is required"),
});

export type GetPurchaseOrderByPONumberParams = z.infer<typeof getPurchaseOrderByPONumberParamsSchema>;
