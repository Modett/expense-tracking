import { z } from "zod";

const nullableUuid = z
  .union([z.string().uuid(), z.literal(""), z.undefined()])
  .transform((val) => (val === "" ? undefined : val))
  .optional();

const optionalBoolean = z
  .union([z.string(), z.boolean(), z.undefined()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
      if (val.toLowerCase() === "true") return true;
      if (val.toLowerCase() === "false") return false;
    }
    return undefined;
  })
  .optional();

const optionalNumber = z
  .union([z.string(), z.number(), z.undefined(), z.null()])
  .transform((val) => {
    if (typeof val === "number") return val;
    if (typeof val === "string" && val.trim().length > 0) {
      const parsed = Number(val);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  })
  .optional();

export const getAllApprovalRulesQuerySchema = z.object({
  categoryId: nullableUuid,
  departmentId: nullableUuid,
  approverRole: z.enum(["staff", "manager", "finance", "admin"]).optional(),
  isActive: optionalBoolean,
  minAmountGreaterThan: optionalNumber,
  minAmountLessThan: optionalNumber,
});

export type GetAllApprovalRulesQuery = z.infer<
  typeof getAllApprovalRulesQuerySchema
>;
