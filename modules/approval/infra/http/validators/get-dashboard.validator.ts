import { z } from "zod";

// Dashboard endpoint doesn't require query parameters
// It uses the authenticated user's ID and role from the JWT token
export const getDashboardQuerySchema = z.object({});

export type GetDashboardQuery = z.infer<typeof getDashboardQuerySchema>;
