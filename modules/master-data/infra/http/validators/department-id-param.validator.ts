import { z } from "zod";

export const departmentIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type DepartmentIdParam = z.infer<typeof departmentIdParamSchema>;
