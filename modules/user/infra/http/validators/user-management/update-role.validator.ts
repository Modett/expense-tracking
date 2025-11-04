import { z } from "zod";

export const updateRoleSchema = z.object({
  role: z.enum(["staff", "manager", "finance", "admin"]),
});

export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
