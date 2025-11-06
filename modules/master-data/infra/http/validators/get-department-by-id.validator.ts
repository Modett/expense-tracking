import { z } from "zod";

export const getDepartmentByIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type GetDepartmentByIdParams = z.infer<typeof getDepartmentByIdParamsSchema>;
