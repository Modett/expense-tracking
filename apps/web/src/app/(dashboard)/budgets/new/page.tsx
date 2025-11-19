"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useCreateBudget, BudgetEnforcementType } from "@/features/budgets";
import { useDepartments } from "@/features/departments";
import { useCategories } from "@/features/categories";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";

const createBudgetSchema = z.object({
  departmentId: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform(val => val || null),
  categoryId: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform(val => val || null),
  budgetAmount: z.number().min(1, "Budget amount must be greater than 0"),
  fiscalPeriod: z.string().min(1, "Fiscal period is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  enforcementType: z.nativeEnum(BudgetEnforcementType),
  overrideAllowed: z.boolean(),
  warningThreshold1: z.number().min(0).max(100),
  warningThreshold2: z.number().min(0).max(100),
  criticalThreshold: z.number().min(0).max(100),
});

type CreateBudgetFormData = z.infer<typeof createBudgetSchema>;
const CATEGORY_ALL_VALUE = "__ALL__";
const ORG_LEVEL_VALUE = "__ORG_WIDE__";

export default function CreateBudgetPage() {
  const router = useRouter();
  const { data: departments } = useDepartments();
  const { data: categories } = useCategories();
  const createBudgetMutation = useCreateBudget();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateBudgetFormData>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      enforcementType: BudgetEnforcementType.SOFT,
      overrideAllowed: true,
      warningThreshold1: 80,
      warningThreshold2: 90,
      criticalThreshold: 100,
    },
  });

  const onSubmit = (data: CreateBudgetFormData) => {
    const payload = {
      ...data,
      categoryId: data.categoryId || null,
      departmentId: data.departmentId || null,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    };
    createBudgetMutation.mutate(payload);
  };

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
        <h1 className="text-3xl font-bold text-foreground">Create Budget</h1>
        <p className="text-muted-foreground mt-2">Set up a new budget for department or category</p>
      </div>

      <Card className="bg-card border-border max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="departmentId" className="text-muted-foreground">
                Department (Optional)
              </Label>
              <Select
                value={watch("departmentId") ?? ORG_LEVEL_VALUE}
                onValueChange={(value) => {
                  if (value === ORG_LEVEL_VALUE) {
                    setValue("departmentId", null);
                    return;
                  }
                  setValue("departmentId", value);
                }}
              >
                <SelectTrigger className="mt-2 bg-muted border-border text-foreground">
                  <SelectValue placeholder="Organization-wide" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value={ORG_LEVEL_VALUE}>Organization-wide (no department)</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.departmentId} value={dept.departmentId}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="categoryId" className="text-muted-foreground">
                Category (Optional)
              </Label>
              <Select
                value={watch("categoryId") ?? CATEGORY_ALL_VALUE}
                onValueChange={(value) => {
                  if (value === CATEGORY_ALL_VALUE) {
                    setValue("categoryId", null);
                    return;
                  }
                  setValue("categoryId", value);
                }}
              >
                <SelectTrigger className="mt-2 bg-muted border-border text-foreground">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value={CATEGORY_ALL_VALUE}>All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.categoryId} value={cat.categoryId}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="budgetAmount" className="text-muted-foreground">
                Budget Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="budgetAmount"
                type="number"
                step="0.01"
                placeholder="10000.00"
                className="mt-2 bg-muted border-border text-foreground"
                {...register("budgetAmount", { valueAsNumber: true })}
              />
              {errors.budgetAmount && (
                <p className="text-sm text-red-500 mt-1">{errors.budgetAmount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="fiscalPeriod" className="text-muted-foreground">
                Fiscal Period <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fiscalPeriod"
                placeholder="2024-Q1 or 2024 or 2024-01"
                className="mt-2 bg-muted border-border text-foreground"
                {...register("fiscalPeriod")}
              />
              <p className="text-xs text-muted-foreground mt-1">Format: YYYY, YYYY-Q1, YYYY-H1, or YYYY-MM</p>
              {errors.fiscalPeriod && (
                <p className="text-sm text-red-500 mt-1">{errors.fiscalPeriod.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="startDate" className="text-muted-foreground">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                className="mt-2 bg-muted border-border text-foreground"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate" className="text-muted-foreground">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                className="mt-2 bg-muted border-border text-foreground"
                {...register("endDate")}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Enforcement Settings</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="enforcementType" className="text-muted-foreground">
                  Enforcement Type
                </Label>
                <Select
                  value={watch("enforcementType")}
                  onValueChange={(value) => setValue("enforcementType", value as BudgetEnforcementType)}
                >
                  <SelectTrigger className="mt-2 bg-muted border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value={BudgetEnforcementType.SOFT}>Soft (Warning Only)</SelectItem>
                    <SelectItem value={BudgetEnforcementType.HARD}>Hard (Strict Block)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mt-8">
                <Checkbox
                  id="overrideAllowed"
                  checked={watch("overrideAllowed")}
                  onCheckedChange={(checked) => setValue("overrideAllowed", !!checked)}
                  className="border-border"
                />
                <Label htmlFor="overrideAllowed" className="text-muted-foreground cursor-pointer">
                  Allow Budget Override
                </Label>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Alert Thresholds (%)</h3>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <Label htmlFor="warningThreshold1" className="text-muted-foreground">
                  Warning 1
                </Label>
                <Input
                  id="warningThreshold1"
                  type="number"
                  min="0"
                  max="100"
                  className="mt-2 bg-muted border-border text-foreground"
                  {...register("warningThreshold1", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="warningThreshold2" className="text-muted-foreground">
                  Warning 2
                </Label>
                <Input
                  id="warningThreshold2"
                  type="number"
                  min="0"
                  max="100"
                  className="mt-2 bg-muted border-border text-foreground"
                  {...register("warningThreshold2", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="criticalThreshold" className="text-muted-foreground">
                  Critical
                </Label>
                <Input
                  id="criticalThreshold"
                  type="number"
                  min="0"
                  max="100"
                  className="mt-2 bg-muted border-border text-foreground"
                  {...register("criticalThreshold", { valueAsNumber: true })}
                />
              </div>
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
              disabled={createBudgetMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {createBudgetMutation.isPending ? "Creating..." : "Create Budget"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

