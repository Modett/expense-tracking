import { z } from "zod";

export const createDepartmentBodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().min(2).max(20).regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, and underscores").optional(),
});

export type CreateDepartmentBody = z.infer<typeof createDepartmentBodySchema>;
