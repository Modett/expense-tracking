import { z } from "zod";

export const createInventoryDropBodySchema = z.object({
  dropNumber: z.string().min(1, "Drop number is required"),
  fabricType: z.string().min(1, "Fabric type is required"),
  quantity: z.number().nonnegative("Quantity must be non-negative"),
  unitCost: z.number().nonnegative("Unit cost must be non-negative"),
  receivedOn: z.coerce.date().optional(),
  supplier: z.string().optional(),
});

export type CreateInventoryDropBody = z.infer<typeof createInventoryDropBodySchema>;
