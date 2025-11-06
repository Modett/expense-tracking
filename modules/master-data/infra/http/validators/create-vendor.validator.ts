import { z } from "zod";

export const createVendorBodySchema = z.object({
  name: z.string().trim().min(2).max(200),
  gstNumber: z.string().trim().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i, "Invalid GST format").optional(),
  email: z.string().trim().email().max(255).optional(),
  phone: z.string().trim().min(10).max(20).optional(),
  address: z.string().trim().max(500).optional(),
});

export type CreateVendorBody = z.infer<typeof createVendorBodySchema>;
