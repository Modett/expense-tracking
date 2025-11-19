"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRecentExpenses,
  useTeamSpending,
  useExpensesByCategory,
  type RecentExpenseItem,
} from "@/features/dashboard";
import { useAuth } from "@/providers/auth-provider";
import { useApprovalDashboard } from "@/features/approvals";
import { useExpenseAggregations } from "@/features/expenses";
import { useDepartments } from "@/features/departments";
import { useCategories } from "@/features/categories";
import { expensesApi } from "@/features/expenses/api/expenses.api";
import {
  FileText,
  Clock,
  DollarSign,
  CheckCircle,
  Plus,
  Receipt,
  FileBarChart,
  Building2,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { RoleEnum } from "@/types/common.types";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const normalizedRole =
    typeof user?.role === "string" ? user.role.toLowerCase() : undefined;
  const isStaff = normalizedRole === RoleEnum.STAFF;
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  const currentRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      startISO: start.toISOString(),
      endISO: now.toISOString(),
    };
  }, []);

  const { data: expenseAggregations, isLoading: expenseAggregationsLoading } =
    useExpenseAggregations(
      {
        dateFrom: currentRange.startISO,
        dateTo: currentRange.endISO,
        groupBy: ["department"],
      },
      { enabled: true }
    );
  const totalExpensesAmount = useMemo(
    () =>
      expenseAggregations?.reduce((sum, agg) => sum + agg.totalAmount, 0) ?? 0,
    [expenseAggregations]
  );

  const { data: approvalsDashboard, isLoading: approvalsDashboardLoading } =
    useApprovalDashboard();
  const pendingApprovalTasks = useMemo(
    () => (approvalsDashboard?.myPendingApprovals ?? []).slice(0, 4),
    [approvalsDashboard]
  );
  const pendingApprovalsCount =
    approvalsDashboard?.pendingCount ??
    approvalsDashboard?.summary?.totalPending ??
    0;

  const { data: recentExpenses, isLoading: expensesLoading } =
    useRecentExpenses(5, { enabled: true });
  const { data: teamSpending, isLoading: teamLoading } = useTeamSpending(
    "monthly",
    { enabled: false }
  );
  const { data: categoryExpenses, isLoading: categoryLoading } =
    useExpensesByCategory("monthly", { enabled: false });
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const activeDepartmentsCount = useMemo(
    () => departments?.filter((dept) => dept.isActive).length ?? 0,
    [departments]
  );
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const activeCategoriesCount = useMemo(
    () => categories?.filter((category) => category.isActive).length ?? 0,
    [categories]
  );
  const statsLoading =
    expenseAggregationsLoading ||
    approvalsDashboardLoading ||
    departmentsLoading ||
    categoriesLoading;

  const handleGenerateReport = async () => {
    try {
      setIsDownloadingReport(true);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const monthName = now.toLocaleString("default", { month: "long" });
      const blob = await expensesApi.downloadMonthlyReport({ month, year });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `monthly-report-${monthName}-${year}.csv`;
      document.body.appendChild(link);
      link.click();

      // Clean up after a short delay to ensure download starts
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Report generated",
        description: `Monthly expense report for ${monthName} ${year} has been downloaded.`,
      });
    } catch (error: any) {
      console.error("Error generating report:", error);

      let errorMessage = "Please try again later.";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      // Check if it's a permission error
      if (
        errorMessage.includes("Forbidden") ||
        errorMessage.includes("Manager access required")
      ) {
        errorMessage =
          "You need Manager or Admin role to generate reports. Please contact your administrator.";
      }

      toast({
        title: "Failed to generate report",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDownloadingReport(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 overflow-hidden">
            <div className="flex h-full w-full items-center justify-center text-white font-semibold text-xl">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user?.name?.split(" ")[0] || "User"}
            </h1>
            <p className="text-zinc-400">Here's what's happening today</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            {statsLoading ? (
              <Skeleton className="h-24 bg-zinc-800" />
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="text-sm text-zinc-400">Total Expenses</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(totalExpensesAmount)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">This month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            {statsLoading ? (
              <Skeleton className="h-24 bg-zinc-800" />
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="text-sm text-zinc-400">
                    Pending Approvals
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {pendingApprovalsCount}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Awaiting your action
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {!isStaff && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              {statsLoading ? (
                <Skeleton className="h-24 bg-zinc-800" />
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Building2 className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-sm text-zinc-400">
                      Active Departments
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {activeDepartmentsCount}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Currently active
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {!isStaff && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              {statsLoading ? (
                <Skeleton className="h-24 bg-zinc-800" />
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-sm text-zinc-400">
                      Active Categories
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {activeCategoriesCount}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Available for expenses
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Pending Tasks */}
        <Card className="bg-zinc-900 border-zinc-800 col-span-1 xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white font-semibold text-lg">
                Pending Tasks
              </CardTitle>
              <Link href="/approvals">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white"
                >
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApprovalTasks.length > 0 ? (
              pendingApprovalTasks.map((task) => (
                <Link key={task.approvalId} href={`/approvals/${task.approvalId}`}>
                  <div className="flex flex-col gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-white">
                        {task.expenseDescription || "Expense approval"}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-xs text-zinc-500">
                        <span className="uppercase tracking-wide">
                          {task.priority?.toUpperCase() || "STANDARD"}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{new Date(task.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex w-full justify-between items-center gap-4 text-sm md:w-auto">
                      <div className="text-right">
                        <p className="text-zinc-500 text-xs uppercase">Amount</p>
                        <p className="text-white font-semibold">
                          {formatCurrency(task.expenseAmount || 0)}
                        </p>
                      </div>
                      <div className="text-right text-xs text-zinc-400 md:text-sm">
                        <p className="uppercase text-[10px] tracking-wide">Status</p>
                        <p className="text-white">
                          {task.status?.toLowerCase() ?? "pending"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center text-sm text-zinc-500 py-6">
                No pending approvals right now.
              </div>
            )}
          </CardContent>        </Card>
      </div>

      {/* Quick Access */}
      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardHeader>
          <CardTitle className="text-white font-semibold text-lg">
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${isStaff ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
            <Link href="/expenses/new">
              <Button
                variant="ghost"
                className="w-full h-20 bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 flex flex-col items-center gap-2"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <span className="text-white text-sm">New expense</span>
              </Button>
            </Link>

            <Link href="/expenses/receipts">
              <Button
                variant="ghost"
                className="w-full h-20 bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 flex flex-col items-center gap-2"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <span className="text-white text-sm">Add receipt</span>
              </Button>
            </Link>

            {!isStaff && (
              <Button
                variant="ghost"
                className="w-full h-20 bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 flex flex-col items-center gap-2"
                onClick={handleGenerateReport}
                disabled={isDownloadingReport}
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                  <FileBarChart className="h-5 w-5 text-white" />
                </div>
                <span className="text-white text-sm">
                  {isDownloadingReport ? "Preparing..." : "Create report"}
                </span>
              </Button>
            )}

            <Link href="/approvals">
              <Button
                variant="ghost"
                className="w-full h-20 bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 flex flex-col items-center gap-2"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-white text-sm">Review approvals</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Report */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white font-semibold text-lg">
            Monthly Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Spending Trend */}
            <div>
              <h3 className="text-zinc-400 text-sm mb-4">
                Team Spending Trend
              </h3>
              {teamLoading ? (
                <Skeleton className="h-64 bg-zinc-800" />
              ) : teamSpending && teamSpending.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={teamSpending}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="team" stroke="#71717a" />
                    <YAxis stroke="#71717a" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#06b6d4"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-sm text-zinc-400 py-6">
                  No team spending data yet.
                </div>
              )}
            </div>

            {/* Day-to-Day Expenses */}
            <div>
              <h3 className="text-zinc-400 text-sm mb-4">
                Day-to-Day Expenses
              </h3>
              {categoryLoading ? (
                <Skeleton className="h-64 bg-zinc-800" />
              ) : categoryExpenses && categoryExpenses.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryExpenses}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="category" stroke="#71717a" />
                    <YAxis stroke="#71717a" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#a855f7"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-sm text-zinc-400 py-6">
                  No category data yet.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

