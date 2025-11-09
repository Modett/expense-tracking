import { z } from "zod";

export const createPurchaseOrderBodySchema = z.object({
  poNumber: z.string().min(1, "PO number is required"),
  vendorId: z.string().uuid("Vendor ID must be a valid UUID"),
  totalValue: z.number().nonnegative("Total value must be non-negative"),
  description: z.string().optional(),
  issuedDate: z.coerce.date().optional(),
});

export type CreatePurchaseOrderBody = z.infer<typeof createPurchaseOrderBodySchema>;
