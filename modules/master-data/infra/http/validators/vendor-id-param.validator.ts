import { z } from "zod";

export const vendorIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type VendorIdParam = z.infer<typeof vendorIdParamSchema>;
