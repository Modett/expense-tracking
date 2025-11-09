import { z } from "zod";

export const getInventoryDropsByFabricTypeParamsSchema = z.object({
  fabricType: z.string().min(1, "Fabric type is required"),
});

export type GetInventoryDropsByFabricTypeParams = z.infer<typeof getInventoryDropsByFabricTypeParamsSchema>;
