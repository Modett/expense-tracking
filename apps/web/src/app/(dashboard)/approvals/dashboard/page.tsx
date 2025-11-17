"use client";

import Link from "next/link";
import { useApprovalDashboard } from "@/features/approvals";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  Eye,
  BarChart3,
  Calendar,
  Timer,
} from "lucide-react";

export default function ApprovalDashboardPage() {
  const { data: dashboard, isLoading } = useApprovalDashboard();

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { label: string; className: string }> = {
      emergency: { label: "Emergency", className: "bg-red-500/10 text-red-500 border-red-500/20" },
      urgent: { label: "Urgent", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
      standard: { label: "Standard", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      routine: { label: "Routine", className: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
    };

    const config = priorityConfig[priority.toLowerCase()] || priorityConfig.standard;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getBudgetBadge = (status?: string) => {
    const budgetConfig: Record<string, { label: string; className: string }> = {
      within: { label: "Within Budget", className: "bg-green-500/10 text-green-500 border-green-500/20" },
      warning: { label: "Near Limit", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
      exceeded: { label: "Over Budget", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    };

    if (!status) return null;
    const config = budgetConfig[status] || budgetConfig.within;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Approval Dashboard</h1>
          <p className="text-zinc-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Approval Dashboard</h1>
          <p className="text-zinc-400 mt-2">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Approval Dashboard</h1>
            <p className="text-zinc-400 mt-2">
              Role-based overview of your approval workflow
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/approvals">View Pending Approvals</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-sm text-zinc-400">Pending</span>
          </div>
          <p className="text-3xl font-bold text-white">{dashboard.summary.totalPending}</p>
          {dashboard.urgentCount > 0 && (
            <p className="text-sm text-orange-500 mt-1">
              {dashboard.urgentCount} urgent
            </p>
          )}
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-zinc-400">Approved</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {dashboard.summary.totalApprovedThisWeek}
          </p>
          <p className="text-sm text-zinc-500 mt-1">This week</p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-sm text-zinc-400">Rejected</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {dashboard.summary.totalRejectedThisWeek}
          </p>
          <p className="text-sm text-zinc-500 mt-1">This week</p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Timer className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-zinc-400">Avg Time</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {dashboard.summary.averageApprovalTime.toFixed(1)}
          </p>
          <p className="text-sm text-zinc-500 mt-1">hours</p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-sm text-zinc-400">Oldest</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {dashboard.summary.oldestPendingDays}
          </p>
          <p className="text-sm text-zinc-500 mt-1">days pending</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Action Required ({dashboard.pendingCount})
            </h2>
            {dashboard.pendingCount > 0 && (
              <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300" asChild>
                <Link href="/approvals">View All</Link>
              </Button>
            )}
          </div>
          {dashboard.myPendingApprovals.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.myPendingApprovals.slice(0, 5).map((approval) => (
                <div
                  key={approval.approvalId}
                  className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Link
                        href={`/approvals/${approval.approvalId}`}
                        className="text-white hover:text-purple-400 font-medium line-clamp-1"
                      >
                        {approval.expenseDescription}
                      </Link>
                      <p className="text-sm text-zinc-500 mt-1">
                        by {approval.submittedBy}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-white font-mono font-semibold">
                        ${approval.expenseAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(approval.priority)}
                      {getBudgetBadge(approval.budgetStatus)}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-zinc-400 hover:text-white hover:bg-zinc-700"
                      asChild
                    >
                      <Link href={`/approvals/${approval.approvalId}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Link>
                    </Button>
                  </div>
                  {approval.daysUntilDeadline !== null && approval.daysUntilDeadline !== undefined && (
                    <div className="mt-2 text-sm">
                      {approval.daysUntilDeadline < 0 ? (
                        <span className="text-red-500">
                          Overdue by {Math.abs(approval.daysUntilDeadline)} days
                        </span>
                      ) : approval.daysUntilDeadline === 0 ? (
                        <span className="text-orange-500">Due today</span>
                      ) : (
                        <span className="text-zinc-500">
                          {approval.daysUntilDeadline} days until deadline
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Awaiting Higher Level
            </h2>
          </div>
          {dashboard.awaitingHigherLevel.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">No expenses in progress</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.awaitingHigherLevel.slice(0, 5).map((approval) => (
                <div
                  key={approval.approvalId}
                  className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Link
                        href={`/expenses/${approval.expenseId}`}
                        className="text-white hover:text-purple-400 font-medium line-clamp-1"
                      >
                        {approval.expenseDescription}
                      </Link>
                      <p className="text-sm text-zinc-500 mt-1">
                        Level {approval.approvalOrder} " {approval.submittedBy}
                      </p>
                    </div>
                    <p className="text-white font-mono font-semibold ml-4">
                      ${approval.expenseAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      {approval.status}
                    </Badge>
                    {getPriorityBadge(approval.priority)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Recently Approved
            </h2>
          </div>
          {dashboard.recentlyApproved.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">No recent approvals</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-900">
                  <TableHead className="text-zinc-400">Expense</TableHead>
                  <TableHead className="text-zinc-400">Amount</TableHead>
                  <TableHead className="text-zinc-400">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.recentlyApproved.slice(0, 5).map((approval) => (
                  <TableRow key={approval.approvalId} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell>
                      <Link
                        href={`/expenses/${approval.expenseId}`}
                        className="text-white hover:text-purple-400 line-clamp-1"
                      >
                        {approval.expenseDescription}
                      </Link>
                      <p className="text-sm text-zinc-500">{approval.submittedBy}</p>
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      ${approval.expenseAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {new Date(approval.submittedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Recently Rejected
            </h2>
          </div>
          {dashboard.recentlyRejected.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">No recent rejections</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-900">
                  <TableHead className="text-zinc-400">Expense</TableHead>
                  <TableHead className="text-zinc-400">Amount</TableHead>
                  <TableHead className="text-zinc-400">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.recentlyRejected.slice(0, 5).map((approval) => (
                  <TableRow key={approval.approvalId} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell>
                      <Link
                        href={`/expenses/${approval.expenseId}`}
                        className="text-white hover:text-purple-400 line-clamp-1"
                      >
                        {approval.expenseDescription}
                      </Link>
                      <p className="text-sm text-zinc-500">{approval.submittedBy}</p>
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      ${approval.expenseAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {new Date(approval.submittedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {dashboard.rejectedAtLowerLevels.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Rejections at Lower Levels (Oversight)
            </h2>
          </div>
          <div className="space-y-3">
            {dashboard.rejectedAtLowerLevels.slice(0, 5).map((approval) => (
              <div
                key={approval.approvalId}
                className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/expenses/${approval.expenseId}`}
                      className="text-white hover:text-purple-400 font-medium"
                    >
                      {approval.expenseDescription}
                    </Link>
                    <p className="text-sm text-zinc-500 mt-1">
                      Rejected at Level {approval.approvalOrder} " {approval.submittedBy}
                    </p>
                  </div>
                  <p className="text-white font-mono font-semibold ml-4">
                    ${approval.expenseAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
