import { z } from "zod";

export const getAllPurchaseOrdersQuerySchema = z.object({
  vendorId: z.string().uuid("Vendor ID must be a valid UUID").optional(),
  status: z.enum(["draft", "issued", "received", "partial", "cancelled", "closed"]).optional(),
  issuedDateFrom: z.coerce.date().optional(),
  issuedDateTo: z.coerce.date().optional(),
  minTotalValue: z.coerce.number().nonnegative().optional(),
  maxTotalValue: z.coerce.number().nonnegative().optional(),
});

export type GetAllPurchaseOrdersQuery = z.infer<typeof getAllPurchaseOrdersQuerySchema>;
