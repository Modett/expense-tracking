import { z } from "zod";

export const getAllInventoryDropsQuerySchema = z.object({
  fabricType: z.string().optional(),
  supplier: z.string().optional(),
  receivedDateFrom: z.coerce.date().optional(),
  receivedDateTo: z.coerce.date().optional(),
  minQuantity: z.coerce.number().nonnegative().optional(),
  maxQuantity: z.coerce.number().nonnegative().optional(),
  minTotalCost: z.coerce.number().nonnegative().optional(),
  maxTotalCost: z.coerce.number().nonnegative().optional(),
});

export type GetAllInventoryDropsQuery = z.infer<typeof getAllInventoryDropsQuerySchema>;
