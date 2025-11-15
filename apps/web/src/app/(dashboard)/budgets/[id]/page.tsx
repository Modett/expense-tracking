"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBudget } from "@/features/budgets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Edit,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  Tag,
} from "lucide-react";

export default function BudgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const budgetId = params.id as string;

  const { data: budget, isLoading } = useBudget(budgetId);

  if (isLoading || !budget) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Loading...</h1>
        </div>
      </div>
    );
  }

  const utilizationPercentage = budget.utilizationPercentage || 0;
  const isOverBudget = utilizationPercentage >= 100;
  const isNearLimit = utilizationPercentage >= 80 && utilizationPercentage < 100;
  const isOnTrack = utilizationPercentage < 80;

  const getUtilizationColor = () => {
    if (utilizationPercentage >= 100) return "text-red-500";
    if (utilizationPercentage >= 90) return "text-orange-500";
    if (utilizationPercentage >= 80) return "text-yellow-500";
    return "text-green-500";
  };

  const getProgressColor = () => {
    if (utilizationPercentage >= 100) return "bg-red-500";
    if (utilizationPercentage >= 90) return "bg-orange-500";
    if (utilizationPercentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Calculate threshold levels
  const thresholds = [
    { level: "Critical", percentage: 100, amount: budget.budgetAmount },
    { level: "Warning", percentage: 90, amount: budget.budgetAmount * 0.9 },
    { level: "Caution", percentage: 80, amount: budget.budgetAmount * 0.8 },
    { level: "Target", percentage: 75, amount: budget.budgetAmount * 0.75 },
  ];

  const currentThreshold = thresholds.find(
    (t) => utilizationPercentage >= t.percentage
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800 mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Budgets
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {budget.department?.name || "Budget"} - {budget.fiscalPeriod}
            </h1>
            <p className="text-zinc-400 mt-2">
              {budget.category?.name || "All Categories"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
              asChild
            >
              <Link href={`/budgets/${budgetId}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Budget
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {isOverBudget && (
        <Card className="bg-red-500/10 border-red-500/30 p-4 mb-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-red-500 font-semibold">Budget Exceeded</h3>
              <p className="text-red-400 text-sm mt-1">
                This budget has exceeded the allocated amount by $
                {Math.abs(Number(budget.remainingAmount)).toFixed(2)}. Consider
                requesting a budget increase or reducing expenses.
              </p>
            </div>
          </div>
        </Card>
      )}

      {isNearLimit && !isOverBudget && (
        <Card className="bg-yellow-500/10 border-yellow-500/30 p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="text-yellow-500 font-semibold">Approaching Limit</h3>
              <p className="text-yellow-400 text-sm mt-1">
                This budget is at {utilizationPercentage.toFixed(1)}% utilization.
                Only ${Number(budget.remainingAmount).toFixed(2)} remaining.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm text-zinc-400">Budget Amount</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${Number(budget.budgetAmount).toFixed(2)}
          </p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-zinc-400">Spent Amount</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${Number(budget.spentAmount).toFixed(2)}
          </p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${isOverBudget ? 'bg-red-500/10' : 'bg-green-500/10'} rounded-lg`}>
              {isOverBudget ? (
                <TrendingDown className="w-5 h-5 text-red-500" />
              ) : (
                <DollarSign className="w-5 h-5 text-green-500" />
              )}
            </div>
            <span className="text-sm text-zinc-400">Remaining</span>
          </div>
          <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
            ${Math.abs(Number(budget.remainingAmount)).toFixed(2)}
            {isOverBudget && " over"}
          </p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-sm text-zinc-400">Utilization</span>
          </div>
          <p className={`text-2xl font-bold ${getUtilizationColor()}`}>
            {utilizationPercentage.toFixed(1)}%
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Utilization Chart */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Budget Utilization
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-zinc-400">Overall Progress</span>
                  <span className={`text-sm font-semibold ${getUtilizationColor()}`}>
                    {utilizationPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(utilizationPercentage, 100)}
                  className="h-4"
                  indicatorClassName={getProgressColor()}
                />
                <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                  <span>${Number(budget.spentAmount).toFixed(2)} spent</span>
                  <span>${Number(budget.budgetAmount).toFixed(2)} total</span>
                </div>
              </div>

              {/* Visual Budget Bar */}
              <div className="relative">
                <div className="text-sm font-medium text-white mb-3">
                  Budget vs Actual Comparison
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-400">Allocated Budget</span>
                      <span className="text-xs text-white">
                        ${Number(budget.budgetAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-8 bg-zinc-800 rounded-lg" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-400">Actual Spending</span>
                      <span className="text-xs text-white">
                        ${Number(budget.spentAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-8 bg-zinc-800 rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor()} transition-all`}
                        style={{
                          width: `${Math.min((budget.spentAmount / budget.budgetAmount) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Budget Details */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Budget Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400">Department</label>
                <div className="flex items-center gap-2 mt-2">
                  <Building2 className="w-4 h-4 text-zinc-500" />
                  <p className="text-white">{budget.department?.name || "N/A"}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-400">Category</label>
                <div className="flex items-center gap-2 mt-2">
                  <Tag className="w-4 h-4 text-zinc-500" />
                  <p className="text-white">
                    {budget.category?.name || "All Categories"}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-400">Fiscal Period</label>
                <p className="text-white mt-2">{budget.fiscalPeriod}</p>
              </div>
              <div>
                <label className="text-sm text-zinc-400">Enforcement Type</label>
                <p className="text-white mt-2 capitalize">
                  {budget.enforcementType}
                </p>
              </div>
              <div>
                <label className="text-sm text-zinc-400">Start Date</label>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <p className="text-white">
                    {new Date(budget.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-400">End Date</label>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <p className="text-white">
                    {new Date(budget.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-400">Status</label>
                <div className="mt-2">
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
              <div>
                <label className="text-sm text-zinc-400">Current Health</label>
                <div className="mt-2">
                  {isOverBudget ? (
                    <Badge
                      variant="outline"
                      className="bg-red-500/10 text-red-500 border-red-500/20"
                    >
                      Over Budget
                    </Badge>
                  ) : isNearLimit ? (
                    <Badge
                      variant="outline"
                      className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    >
                      Near Limit
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500 border-green-500/20"
                    >
                      On Track
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Threshold Alerts */}
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Alert Thresholds
            </h2>
            <div className="space-y-3">
              {thresholds.map((threshold) => {
                const isActive = utilizationPercentage >= threshold.percentage;
                const isPassed = utilizationPercentage > threshold.percentage;

                return (
                  <div
                    key={threshold.level}
                    className={`p-3 rounded-lg border transition-all ${
                      isActive
                        ? threshold.percentage >= 100
                          ? "bg-red-500/10 border-red-500/30"
                          : threshold.percentage >= 90
                          ? "bg-orange-500/10 border-orange-500/30"
                          : threshold.percentage >= 80
                          ? "bg-yellow-500/10 border-yellow-500/30"
                          : "bg-blue-500/10 border-blue-500/30"
                        : "bg-zinc-800 border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium ${
                          isActive
                            ? threshold.percentage >= 100
                              ? "text-red-500"
                              : threshold.percentage >= 90
                              ? "text-orange-500"
                              : threshold.percentage >= 80
                              ? "text-yellow-500"
                              : "text-blue-500"
                            : "text-zinc-400"
                        }`}
                      >
                        {threshold.level}
                      </span>
                      {isActive && (
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            threshold.percentage >= 100
                              ? "text-red-500"
                              : threshold.percentage >= 90
                              ? "text-orange-500"
                              : threshold.percentage >= 80
                              ? "text-yellow-500"
                              : "text-blue-500"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={isActive ? "text-white" : "text-zinc-500"}>
                        {threshold.percentage}% threshold
                      </span>
                      <span className={isActive ? "text-white" : "text-zinc-500"}>
                        ${Number(threshold.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {budget.notes && (
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {budget.notes}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
