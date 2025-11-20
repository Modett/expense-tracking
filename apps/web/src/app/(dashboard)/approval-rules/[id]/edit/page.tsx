"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { useApprovalRule, useUpdateApprovalRule, ApproverRoleEnum } from "@/features/approval-rules";
import { useCategories } from "@/features/categories";
import { useDepartments } from "@/features/departments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { withAdminGuard } from "@/hooks/with-admin-guard";

const updateRuleSchema = z.object({
  categoryId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  minAmount: z.number().min(0, "Minimum amount must be 0 or greater"),
  approverRole: z.nativeEnum(ApproverRoleEnum),
  approvalOrder: z.number().min(1, "Approval order must be at least 1"),
}).refine(
  (data) => data.categoryId || data.departmentId,
  {
    message: "Either category or department must be selected",
    path: ["categoryId"],
  }
);

type UpdateRuleFormData = z.infer<typeof updateRuleSchema>;

function EditApprovalRulePage() {
  const params = useParams();
  const router = useRouter();
  const ruleId = params.id as string;

  const { data: rule, isLoading } = useApprovalRule(ruleId);
  const updateRuleMutation = useUpdateApprovalRule();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<UpdateRuleFormData>({
    resolver: zodResolver(updateRuleSchema),
  });

  useEffect(() => {
    if (rule) {
      reset({
        categoryId: rule.categoryId || null,
        departmentId: rule.departmentId || null,
        minAmount: Number(rule.minAmount),
        approverRole: rule.approverRole as ApproverRoleEnum,
        approvalOrder: rule.approvalOrder,
      });
    }
  }, [rule, reset]);

  const onSubmit = (data: UpdateRuleFormData) => {
    updateRuleMutation.mutate(
      { ruleId, data },
      {
        onSuccess: () => router.push("/approval-rules"),
      }
    );
  };

  if (isLoading || !rule) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground hover:bg-muted mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Edit Approval Rule</h1>
        <p className="text-muted-foreground mt-2">
          Update approval rule for {rule.category?.name || rule.department?.name || 'approval workflow'}
        </p>
      </div>

      <Card className="bg-card border-border max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Select either a category or department (or both) for this approval rule <span className="text-red-500">*</span>
            </p>

            <div className="space-y-4">
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <div>
                    <Label className="text-muted-foreground">
                      Category (Optional)
                    </Label>
                    <Select
                      value={field.value || "__none__"}
                      onValueChange={(value) => field.onChange(value === "__none__" ? null : value)}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger className="mt-2 bg-muted border-border text-foreground">
                        <SelectValue placeholder={rule.category?.name || "Select category"} />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="__none__">None</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem
                            key={category.categoryId}
                            value={category.categoryId}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <Controller
                control={control}
                name="departmentId"
                render={({ field }) => (
                  <div>
                    <Label className="text-muted-foreground">
                      Department (Optional)
                    </Label>
                    <Select
                      value={field.value || "__none__"}
                      onValueChange={(value) => field.onChange(value === "__none__" ? null : value)}
                      disabled={departmentsLoading}
                    >
                      <SelectTrigger className="mt-2 bg-muted border-border text-foreground">
                        <SelectValue placeholder={rule.department?.name || "Select department"} />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="__none__">None</SelectItem>
                        {departments?.map((department) => (
                          <SelectItem
                            key={department.departmentId}
                            value={department.departmentId}
                          >
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>

            {errors.categoryId && (
              <p className="text-sm text-red-500 mt-2">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="minAmount" className="text-muted-foreground">
              Minimum Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="minAmount"
              type="number"
              step="0.01"
              className="mt-2 bg-muted border-border text-foreground"
              {...register("minAmount", { valueAsNumber: true })}
            />
            <p className="text-sm text-muted-foreground mt-1">
              This rule will apply to expenses with amounts equal to or greater than this value
            </p>
            {errors.minAmount && (
              <p className="text-sm text-red-500 mt-1">{errors.minAmount.message}</p>
            )}
          </div>

          <Controller
            control={control}
            name="approverRole"
            render={({ field }) => (
              <div>
                <Label htmlFor="approverRole" className="text-muted-foreground">
                  Approver Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as ApproverRoleEnum)
                  }
                >
                  <SelectTrigger className="mt-2 bg-muted border-border text-foreground">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value={ApproverRoleEnum.STAFF}>
                      Staff
                    </SelectItem>
                    <SelectItem value={ApproverRoleEnum.MANAGER}>
                      Manager
                    </SelectItem>
                    <SelectItem value={ApproverRoleEnum.FINANCE}>
                      Finance
                    </SelectItem>
                    <SelectItem value={ApproverRoleEnum.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.approverRole && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.approverRole.message}
                  </p>
                )}
              </div>
            )}
          />

          <div>
            <Label htmlFor="approvalOrder" className="text-muted-foreground">
              Approval Order <span className="text-red-500">*</span>
            </Label>
            <Input
              id="approvalOrder"
              type="number"
              min="1"
              className="mt-2 bg-muted border-border text-foreground"
              {...register("approvalOrder", { valueAsNumber: true })}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Order in the approval chain (1 = first, 2 = second, etc.)
            </p>
            {errors.approvalOrder && (
              <p className="text-sm text-red-500 mt-1">{errors.approvalOrder.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="flex-1 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateRuleMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {updateRuleMutation.isPending ? "Updating..." : "Update Rule"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default withAdminGuard(EditApprovalRulePage, { title: "Edit Approval Rule" });


