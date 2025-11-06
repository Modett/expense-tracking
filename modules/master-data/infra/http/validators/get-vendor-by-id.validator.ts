import { z } from "zod";

export const getVendorByIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type GetVendorByIdParams = z.infer<typeof getVendorByIdParamsSchema>;
