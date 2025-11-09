import { z } from "zod";

export const getPurchaseOrdersByVendorParamsSchema = z.object({
  vendorId: z.string().uuid("Vendor ID must be a valid UUID"),
});

export type GetPurchaseOrdersByVendorParams = z.infer<typeof getPurchaseOrdersByVendorParamsSchema>;
