"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import {
  useBudget,
  useUpdateBudget,
  BudgetEnforcementType,
} from "@/features/budgets";
import { useDepartments } from "@/features/departments";
import { useCategories } from "@/features/categories";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const updateBudgetSchema = z.object({
  budgetAmount: z.number().min(1, "Budget amount must be greater than 0"),
  enforcementType: z.nativeEnum(BudgetEnforcementType),
  overrideAllowed: z.boolean(),
  warningThreshold1: z.number().min(0).max(100),
  warningThreshold2: z.number().min(0).max(100),
  criticalThreshold: z.number().min(0).max(100),
  departmentId: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .default(""),
  categoryId: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .default(""),
});

type UpdateBudgetFormData = z.infer<typeof updateBudgetSchema>;

export default function EditBudgetPage() {
  const router = useRouter();
  const params = useParams();
  const budgetId = params.id as string;

  const { data: budget, isLoading } = useBudget(budgetId);
  const updateBudgetMutation = useUpdateBudget();
  const { data: departments } = useDepartments();
  const { data: categories } = useCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateBudgetFormData>({
    resolver: zodResolver(updateBudgetSchema),
  });

  useEffect(() => {
    if (budget) {
      reset({
        budgetAmount: budget.budgetAmount,
        enforcementType: budget.enforcementType,
        overrideAllowed: budget.overrideAllowed,
        warningThreshold1: budget.warningThreshold1,
        warningThreshold2: budget.warningThreshold2,
      criticalThreshold: budget.criticalThreshold,
        departmentId: budget.departmentId || "",
        categoryId: budget.categoryId || "",
      });
    }
  }, [budget, reset]);

  const onSubmit = (data: UpdateBudgetFormData) => {
    const payload = {
      ...data,
      departmentId: data.departmentId ? data.departmentId : null,
      categoryId: data.categoryId ? data.categoryId : null,
    };

    updateBudgetMutation.mutate(
      {
        budgetId,
        data: payload,
      },
      {
        onSuccess: () => router.push("/budgets"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Budget</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Budget</h1>
          <p className="text-muted-foreground mt-2">Budget not found</p>
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
        <h1 className="text-3xl font-bold text-foreground">Edit Budget</h1>
        <p className="text-muted-foreground mt-2">
          Update allocations and enforcement settings for this budget.
        </p>
      </div>

      <Card className="bg-card border-border max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground" htmlFor="departmentId">
                Department
              </Label>
              <select
                id="departmentId"
                className="mt-2 w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                {...register("departmentId")}
              >
                <option value="">Organization-wide</option>
                {departments?.map((dept) => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-muted-foreground" htmlFor="categoryId">
                Category
              </Label>
              <select
                id="categoryId"
                className="mt-2 w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                {...register("categoryId")}
              >
                <option value="">Not specified</option>
                {categories?.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="budgetAmount" className="text-muted-foreground">
              Budget Amount
            </Label>
            <Input
              id="budgetAmount"
              type="number"
              step="0.01"
              className="mt-2 bg-muted border-border text-foreground"
              {...register("budgetAmount", { valueAsNumber: true })}
            />
            {errors.budgetAmount && (
              <p className="text-sm text-red-500 mt-1">
                {errors.budgetAmount.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="enforcementType" className="text-muted-foreground">
                Enforcement Type
              </Label>
              <select
                id="enforcementType"
                className="mt-2 w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                {...register("enforcementType")}
              >
                <option value={BudgetEnforcementType.SOFT}>
                  Soft (allow with warnings)
                </option>
                <option value={BudgetEnforcementType.HARD}>
                  Hard (block overages)
                </option>
              </select>
              {errors.enforcementType && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.enforcementType.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                id="overrideAllowed"
                type="checkbox"
                className="h-4 w-4"
                {...register("overrideAllowed")}
              />
              <div>
                <Label htmlFor="overrideAllowed" className="text-muted-foreground">
                  Allow Overrides
                </Label>
                <p className="text-xs text-muted-foreground">
                  Permit managers to request budget exceptions when required.
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Thresholds (%)</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <Label className="text-muted-foreground text-xs uppercase">
                  Warning
                </Label>
                <Input
                  type="number"
                  className="mt-1 bg-muted border-border text-foreground"
                  {...register("warningThreshold1", { valueAsNumber: true })}
                />
                {errors.warningThreshold1 && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.warningThreshold1.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase">Alert</Label>
                <Input
                  type="number"
                  className="mt-1 bg-muted border-border text-foreground"
                  {...register("warningThreshold2", { valueAsNumber: true })}
                />
                {errors.warningThreshold2 && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.warningThreshold2.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase">
                  Critical
                </Label>
                <Input
                  type="number"
                  className="mt-1 bg-muted border-border text-foreground"
                  {...register("criticalThreshold", { valueAsNumber: true })}
                />
                {errors.criticalThreshold && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.criticalThreshold.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Fiscal Period</Label>
              <p className="text-foreground mt-1">{budget.fiscalPeriod}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Duration</Label>
              <p className="text-foreground mt-1">
                {new Date(budget.startDate).toLocaleDateString()} -{" "}
                {new Date(budget.endDate).toLocaleDateString()}
              </p>
            </div>
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
              disabled={updateBudgetMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {updateBudgetMutation.isPending ? "Updating..." : "Update Budget"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

