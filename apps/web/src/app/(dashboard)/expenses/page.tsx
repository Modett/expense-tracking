"use client";

import { useState } from "react";
import Link from "next/link";
import { useExpenses } from "@/features/expenses";
import { ExpenseStatusEnum, ExpensePriorityEnum } from "@/features/expenses/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

export default function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpenseStatusEnum | "">("");
  const [priorityFilter, setPriorityFilter] = useState<ExpensePriorityEnum | "">("");

  const { data, isLoading } = useExpenses({
    page,
    limit: 20,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const getStatusBadge = (status: ExpenseStatusEnum) => {
    const variants: Record<ExpenseStatusEnum, string> = {
      [ExpenseStatusEnum.DRAFT]: "bg-zinc-500/20 text-zinc-400",
      [ExpenseStatusEnum.SUBMITTED]: "bg-blue-500/20 text-blue-400",
      [ExpenseStatusEnum.APPROVED]: "bg-green-500/20 text-green-400",
      [ExpenseStatusEnum.REJECTED]: "bg-red-500/20 text-red-400",
      [ExpenseStatusEnum.CANCELLED]: "bg-gray-500/20 text-gray-400",
    };

    return (
      <Badge className={`${variants[status]} border-0`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: ExpensePriorityEnum) => {
    const variants: Record<ExpensePriorityEnum, string> = {
      [ExpensePriorityEnum.ROUTINE]: "bg-zinc-600/20 text-zinc-400",
      [ExpensePriorityEnum.STANDARD]: "bg-cyan-500/20 text-cyan-400",
      [ExpensePriorityEnum.URGENT]: "bg-orange-500/20 text-orange-400",
      [ExpensePriorityEnum.EMERGENCY]: "bg-red-500/20 text-red-400",
    };

    return (
      <Badge className={`${variants[priority]} border-0 text-xs`}>
        {priority.charAt(0) + priority.slice(1).toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Expenses</h1>
            <p className="text-zinc-400 mt-1">Manage and track all your expenses</p>
          </div>
          <Link href="/expenses/new">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              New Expense
            </Button>
          </Link>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ExpenseStatusEnum | "")}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
              >
                <option value="">All Statuses</option>
                {Object.values(ExpenseStatusEnum).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as ExpensePriorityEnum | "")}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
              >
                <option value="">All Priorities</option>
                {Object.values(ExpensePriorityEnum).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0) + priority.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>

              {(statusFilter || priorityFilter || searchQuery) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStatusFilter("");
                    setPriorityFilter("");
                    setSearchQuery("");
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 bg-zinc-800" />
              ))}
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800">
                    <tr className="text-left text-xs text-zinc-400 uppercase tracking-wider">
                      <th className="p-4">Date</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Vendor</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {data.data.map((expense) => (
                      <tr
                        key={expense.expenseId}
                        className="hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="p-4 text-sm text-zinc-300">
                          {format(new Date(expense.dateOfExpense), "MMM dd, yyyy")}
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs">
                            <p className="text-white font-medium truncate">
                              {expense.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-zinc-300">
                          {expense.category?.name || "-"}
                        </td>
                        <td className="p-4">
                          {expense.department ? (
                            <Badge className="bg-purple-500/20 text-purple-400 border-0">
                              {expense.department.name}
                            </Badge>
                          ) : (
                            <span className="text-zinc-500 text-sm">-</span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-zinc-300">
                          {expense.vendor?.name || "-"}
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-white font-semibold">
                            ${expense.totalAmount.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-4">{getPriorityBadge(expense.priority)}</td>
                        <td className="p-4">{getStatusBadge(expense.status)}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/expenses/${expense.expenseId}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {expense.status === ExpenseStatusEnum.DRAFT && (
                              <>
                                <Link href={`/expenses/${expense.expenseId}/edit`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-zinc-400 hover:text-blue-400"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.meta && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-zinc-800">
                  <div className="text-sm text-zinc-400">
                    Showing {((data.meta.page - 1) * data.meta.limit) + 1} to{" "}
                    {Math.min(data.meta.page * data.meta.limit, data.meta.total)} of{" "}
                    {data.meta.total} expenses
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="text-sm text-zinc-400">
                      Page {data.meta.page} of {data.meta.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= data.meta.totalPages}
                      className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Search className="h-8 w-8 text-zinc-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    No expenses found
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {statusFilter || priorityFilter || searchQuery
                      ? "Try adjusting your filters"
                      : "Get started by creating your first expense"}
                  </p>
                </div>
                {!statusFilter && !priorityFilter && !searchQuery && (
                  <Link href="/expenses/new">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Expense
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
