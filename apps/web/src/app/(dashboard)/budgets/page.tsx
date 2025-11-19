"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  useBudgets,
  useActivateBudget,
  useDeactivateBudget,
  useDeleteBudget,
} from "@/features/budgets";
import type { GetAllBudgetsParams } from "@/features/budgets";
import { useDepartments } from "@/features/departments";
import { useCategories } from "@/features/categories";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { withAdminGuard } from "@/hooks/with-admin-guard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Wallet,
} from "lucide-react";

function BudgetsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [fiscalPeriodFilter, setFiscalPeriodFilter] = useState<string>("ALL");

  const budgetQueryParams = useMemo(() => {
    const params: GetAllBudgetsParams = {};
    if (departmentFilter !== "ALL") {
      params.departmentId = departmentFilter;
    }
    if (categoryFilter !== "ALL") {
      params.categoryId = categoryFilter;
    }
    if (fiscalPeriodFilter !== "ALL") {
      params.fiscalPeriod = fiscalPeriodFilter;
    }
    return Object.keys(params).length > 0 ? params : undefined;
  }, [departmentFilter, categoryFilter, fiscalPeriodFilter]);

  const { data: budgets, isLoading } = useBudgets(budgetQueryParams);
  const { data: departments } = useDepartments();
  const { data: categories } = useCategories();
  const activateBudgetMutation = useActivateBudget();
  const deactivateBudgetMutation = useDeactivateBudget();
  const deleteBudgetMutation = useDeleteBudget();

  const departmentLookup = useMemo(() => {
    if (!departments) return {};
    return departments.reduce<Record<string, (typeof departments)[number]>>(
      (acc, dept) => {
        acc[dept.departmentId] = dept;
        return acc;
      },
      {}
    );
  }, [departments]);

  const categoryLookup = useMemo(() => {
    if (!categories) return {};
    return categories.reduce<Record<string, (typeof categories)[number]>>(
      (acc, category) => {
        acc[category.categoryId] = category;
        return acc;
      },
      {}
    );
  }, [categories]);

  const fiscalPeriods = useMemo(() => {
    if (!budgets) return [];
    const unique = new Set<string>();
    budgets.forEach((budget) => unique.add(budget.fiscalPeriod));
    return Array.from(unique).sort();
  }, [budgets]);

  const hasAppliedFilters =
    departmentFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    fiscalPeriodFilter !== "ALL";

  const handleClearFilters = () => {
    setDepartmentFilter("ALL");
    setCategoryFilter("ALL");
    setFiscalPeriodFilter("ALL");
  };

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    budgetId: string | null;
  }>({
    open: false,
    budgetId: null,
  });

  const handleDelete = () => {
    if (deleteDialog.budgetId) {
      deleteBudgetMutation.mutate(deleteDialog.budgetId, {
        onSuccess: () => setDeleteDialog({ open: false, budgetId: null }),
      });
    }
  };

  const handleToggleActive = (budgetId: string, isActive: boolean) => {
    if (isActive) {
      deactivateBudgetMutation.mutate(budgetId);
    } else {
      activateBudgetMutation.mutate(budgetId);
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 100) return "bg-red-500";
    if (utilization >= 90) return "bg-orange-500";
    if (utilization >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusBadge = (budget: any) => {
    if (budget.isExhausted) {
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-500 border-red-500/20"
        >
          Exhausted
        </Badge>
      );
    }
    if (budget.isOverBudget) {
      return (
        <Badge
          variant="outline"
          className="bg-orange-500/10 text-orange-500 border-orange-500/20"
        >
          Over Budget
        </Badge>
      );
    }
    if (budget.isNearLimit) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        >
          Near Limit
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-green-500/10 text-green-500 border-green-500/20"
      >
        On Track
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-background min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredBudgets =
    budgets?.filter((budget) => {
      if (statusFilter === "active" && !budget.isActive) return false;
      if (statusFilter === "inactive" && budget.isActive) return false;
      if (statusFilter === "overbudget" && !budget.isOverBudget) return false;
      if (statusFilter === "nearlimit" && !budget.isNearLimit) return false;
      return true;
    }) || [];

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budget Management</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage departmental budgets
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/budgets/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="bg-card border-border text-foreground">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments?.map((dept) => (
                <SelectItem key={dept.departmentId} value={dept.departmentId}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-card border-border text-foreground">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="ALL">All Categories</SelectItem>
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

          <Select
            value={fiscalPeriodFilter}
            onValueChange={setFiscalPeriodFilter}
          >
            <SelectTrigger className="bg-card border-border text-foreground">
              <SelectValue placeholder="Filter by fiscal period" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="ALL">All Fiscal Periods</SelectItem>
              {fiscalPeriods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-card border-border text-foreground">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="ALL">All Budgets</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
              <SelectItem value="overbudget">Over Budget</SelectItem>
              <SelectItem value="nearlimit">Near Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasAppliedFilters && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {filteredBudgets.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Budgets Found
          </h3>
          <p className="text-muted-foreground mb-4">
            Create your first budget to start tracking spending
          </p>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/budgets/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBudgets.map((budget) => {
            const departmentInfo =
              budget.department ??
              (budget.departmentId ? departmentLookup[budget.departmentId] : undefined);
            const departmentName = departmentInfo?.name ?? "Unknown Department";
            const categoryInfo =
              budget.category ??
              (budget.categoryId
                ? categoryLookup[budget.categoryId]
                : undefined);

            return (
              <Card
                key={budget.budgetId}
                className="bg-card border-border p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {departmentName}
                    </h3>
                    {categoryInfo && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {categoryInfo.name}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {budget.fiscalPeriod}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(budget)}
                    {budget.isActive ? (
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 border-green-500/20"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-gray-500/10 text-gray-400 border-gray-500/20"
                      >
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Budget Utilization
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {budget.utilizationPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(budget.utilizationPercentage, 100)}
                      className="h-2"
                      indicatorClassName={getUtilizationColor(
                        budget.utilizationPercentage
                      )}
                    />
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Spent: ${Number(budget.spentAmount).toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">
                        Total: ${Number(budget.budgetAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                      <p className="text-lg font-semibold text-foreground">
                        ${Number(budget.remainingAmount).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Enforcement</p>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {budget.enforcementType}
                      </p>
                    </div>
                  </div>

                  {budget.exceededThreshold && (
                    <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-orange-500">
                        {budget.exceededThreshold.level} threshold exceeded (
                        {budget.exceededThreshold.threshold}%)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      {new Date(budget.startDate).toLocaleDateString()} -{" "}
                      {new Date(budget.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={
                          budget.isActive
                            ? "text-gray-500 hover:text-gray-400 hover:bg-gray-500/10"
                            : "text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        }
                        onClick={() =>
                          handleToggleActive(budget.budgetId, budget.isActive)
                        }
                      >
                        {budget.isActive ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                        asChild
                      >
                        <Link href={`/budgets/${budget.budgetId}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            budgetId: budget.budgetId,
                          })
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open: boolean) =>
          setDeleteDialog({ open, budgetId: null })
        }
      >
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this budget? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialog({ open: false, budgetId: null })}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteBudgetMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              {deleteBudgetMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAdminGuard(BudgetsPage, { title: "Budgets" });

