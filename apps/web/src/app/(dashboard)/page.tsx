"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDashboardStats,
  usePendingTasks,
  useRecentExpenses,
  useTeamSpending,
  useExpensesByCategory,
  type RecentExpenseItem,
} from "@/features/dashboard";
import { useAuth } from "@/providers/auth-provider";
import {
  Plane,
  FileText,
  Clock,
  DollarSign,
  CheckCircle,
  Plus,
  Receipt,
  FileBarChart,
  Briefcase,
  AlertTriangle,
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

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  // TODO: Backend endpoints not yet implemented - temporarily disabled
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats({ enabled: false });
  const { data: pendingTasks } = usePendingTasks({ enabled: false });
  const { data: recentExpenses, isLoading: expensesLoading } = useRecentExpenses(5, { enabled: true });
  const { data: teamSpending, isLoading: teamLoading } = useTeamSpending("monthly", { enabled: false });
  const { data: categoryExpenses, isLoading: categoryLoading } = useExpensesByCategory("monthly", { enabled: false });

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
                  {dashboardStats?.totalExpenses || 0}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  This month
                </p>
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
                  <span className="text-sm text-zinc-400">Pending Approvals</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {dashboardStats?.pendingApprovals || 0}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Awaiting your action
                </p>
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
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-sm text-zinc-400">Monthly Budget</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${(dashboardStats?.monthlyBudget || 0).toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Allocated budget
                </p>
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
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-sm text-zinc-400">Team Members</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {dashboardStats?.teamMembers || 0}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Active users
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pending Tasks */}
        <Card className="bg-zinc-900 border-zinc-800 col-span-1 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white font-semibold text-lg">
                Pending Tasks
              </CardTitle>
              <Link href="/approvals">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks && pendingTasks.length > 0 ? (
              pendingTasks.map((task) => {
                const getIcon = () => {
                  switch (task.type) {
                    case 'approval':
                      return <CheckCircle className="h-5 w-5 text-purple-400" />;
                    case 'expense':
                      return <FileText className="h-5 w-5 text-blue-400" />;
                    case 'trip':
                      return <Plane className="h-5 w-5 text-cyan-400" />;
                    case 'upcoming':
                      return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
                    default:
                      return <FileText className="h-5 w-5 text-zinc-400" />;
                  }
                };

                const getHref = () => {
                  switch (task.type) {
                    case 'approval':
                      return '/approvals';
                    case 'expense':
                      return '/expenses';
                    case 'trip':
                      return '/trips';
                    default:
                      return '/';
                  }
                };

                return (
                  <Link key={task.id} href={getHref()}>
                    <TaskItem
                      icon={getIcon()}
                      label={task.label}
                      value={task.count}
                    />
                  </Link>
                );
              })
            ) : (
              <div className="text-center text-zinc-500 py-8">
                No pending tasks
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white font-semibold text-lg">
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 bg-zinc-800" />
                <Skeleton className="h-20 bg-zinc-800" />
                <Skeleton className="h-20 bg-zinc-800" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-xs text-zinc-400 pb-2 border-b border-zinc-800">
                  <div>Subject</div>
                  <div>Employee</div>
                  <div>Team</div>
                  <div className="text-right">Amount</div>
                </div>
                {recentExpenses && recentExpenses.length > 0 ? (
                  recentExpenses.map((expense: RecentExpenseItem) => (
                    <div
                      key={expense.expenseId}
                      className="grid grid-cols-4 gap-2 text-sm items-center hover:bg-zinc-800/50 p-2 rounded-lg transition-colors"
                    >
                      <div className="text-white truncate">
                        {expense.description}
                      </div>
                      <div className="text-zinc-400 truncate">
                        {expense.user?.name || "N/A"}
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            expense.department?.name === "Marketing"
                              ? "bg-purple-500/20 text-purple-400"
                              : expense.department?.name === "Operations"
                                ? "bg-pink-500/20 text-pink-400"
                                : "bg-cyan-500/20 text-cyan-400"
                          }`}
                        >
                          {expense.department?.name || "N/A"}
                        </span>
                      </div>
                      <div className="text-white text-right font-medium">
                        ${expense.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-zinc-400 py-6">
                    No expenses recorded yet.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardHeader>
          <CardTitle className="text-white font-semibold text-lg">
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            <Link href="/expenses/reports">
              <Button
                variant="ghost"
                className="w-full h-20 bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 flex flex-col items-center gap-2"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                  <FileBarChart className="h-5 w-5 text-white" />
                </div>
                <span className="text-white text-sm">Create report</span>
              </Button>
            </Link>

            <Link href="/trips/new">
              <Button
                variant="ghost"
                className="w-full h-20 bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 flex flex-col items-center gap-2"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <span className="text-white text-sm">Create trip</span>
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

function TaskItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-zinc-300 text-sm">{label}</span>
      </div>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}
