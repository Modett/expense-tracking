"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useExpense,
  useDeleteExpense,
  useSubmitExpense,
  useCancelExpense,
} from "@/features/expenses";
import { useTags } from "@/features/tags";
import {
  ExpenseStatusEnum,
  ExpensePriorityEnum,
  BudgetExceptionTypeEnum,
} from "@/features/expenses/types";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  XCircle,
  ExternalLink,
  Calendar,
  DollarSign,
  UserCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const expenseId = params.id as string;

  const { data: expense, isLoading } = useExpense(expenseId);
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense();
  const { mutate: submitExpense, isPending: isSubmitting } = useSubmitExpense();
  const { mutate: cancelExpense, isPending: isCancelling } = useCancelExpense();
  const { data: tags, isLoading: tagsLoading } = useTags();

  const expenseTags = useMemo(() => {
    if (!expense?.tagIds?.length || !tags?.length) return [];
    const byId = new Map(tags.map((tag) => [tag.tagId, tag]));
    return expense.tagIds
      .map((tagId) => byId.get(tagId))
      .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));
  }, [expense?.tagIds, tags]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitBudgetOverride, setSubmitBudgetOverride] =
    useState<BudgetExceptionTypeEnum>(BudgetExceptionTypeEnum.NONE);
  const [submitJustification, setSubmitJustification] = useState("");

  useEffect(() => {
    if (expense) {
      setSubmitBudgetOverride(expense.budgetOverride ?? BudgetExceptionTypeEnum.NONE);
      setSubmitJustification(expense.justification ?? "");
    }
  }, [expense]);

  const getStatusBadge = (status: ExpenseStatusEnum) => {
    const variants: Record<ExpenseStatusEnum, string> = {
      [ExpenseStatusEnum.DRAFT]:
        "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
      [ExpenseStatusEnum.SUBMITTED]:
        "bg-blue-500/20 text-blue-300 border-blue-500/30",
      [ExpenseStatusEnum.APPROVED]:
        "bg-green-500/20 text-green-300 border-green-500/30",
      [ExpenseStatusEnum.REJECTED]:
        "bg-red-500/20 text-red-300 border-red-500/30",
      [ExpenseStatusEnum.CANCELLED]:
        "bg-gray-500/20 text-gray-300 border-gray-500/30",
    };

    return (
      <Badge className={`${variants[status]} text-sm px-3 py-1`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: ExpensePriorityEnum) => {
    const variants: Record<ExpensePriorityEnum, string> = {
      [ExpensePriorityEnum.ROUTINE]:
        "bg-zinc-600/20 text-zinc-300 border-zinc-600/30",
      [ExpensePriorityEnum.STANDARD]:
        "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      [ExpensePriorityEnum.URGENT]:
        "bg-orange-500/20 text-orange-300 border-orange-500/30",
      [ExpensePriorityEnum.EMERGENCY]:
        "bg-red-500/20 text-red-300 border-red-500/30",
    };

    return (
      <Badge className={`${variants[priority]} text-sm px-3 py-1`}>
        {priority.charAt(0) + priority.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const handleDelete = () => {
    deleteExpense(expenseId);
  };

  const handleSubmit = () => {
    if (!expense) return;

    const requiresJustification =
      submitBudgetOverride !== BudgetExceptionTypeEnum.NONE;
    const justification = submitJustification.trim();

    if (
      requiresJustification &&
      (!justification || justification.length < 50)
    ) {
      toast({
        title: "Justification required",
        description:
          "Provide at least 50 characters explaining the budget override.",
        variant: "destructive",
      });
      return;
    }

    submitExpense({
      expenseId,
      data: {
        budgetOverride: submitBudgetOverride,
        justification: justification || undefined,
      },
    });
    setShowSubmitDialog(false);
  };

  const handleCancel = () => {
    cancelExpense(expenseId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64 bg-zinc-800" />
          <Skeleton className="h-96 bg-zinc-800" />
          <Skeleton className="h-64 bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6">
        <div className="max-w-5xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Expense Not Found
          </h2>
          <p className="text-zinc-400 mb-6">
            The expense you're looking for doesn't exist.
          </p>
          <Link href="/expenses">
            <Button
              variant="outline"
              className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Expenses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/expenses">
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-white mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Expenses
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Expense Details
              </h1>
              <p className="text-zinc-400">
                View and manage expense information
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(expense.status)}
              {getPriorityBadge(expense.priority)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Total Amount</p>
                  <p className="text-2xl font-bold text-white">
                    ${expense.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Submitted By</p>
                  <p className="text-lg font-semibold text-white">
                    {expense.user?.name || "Unknown submitter"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {expense.user?.email || `User ID: ${expense.userId}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Expense Date</p>
                  <p className="text-xl font-semibold text-white">
                    {format(new Date(expense.dateOfExpense), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <span className="text-pink-400 font-bold">ID</span>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Expense ID</p>
                  <p className="text-sm font-mono text-white truncate max-w-[200px]">
                    {expense.expenseId.split("-")[0]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Expense Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400">Description</label>
                <p className="text-white mt-1">{expense.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400">Vendor</label>
                  <p className="text-white mt-1">
                    {expense.vendor?.name || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Category</label>
                  <p className="text-white mt-1">
                    {expense.category?.name || "-"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400">Department</label>
                {expense.department ? (
                  <Badge className="bg-purple-500/20 text-purple-400 border-0 mt-1">
                    {expense.department.name}
                  </Badge>
                ) : (
                  <p className="text-zinc-500 mt-1">-</p>
                )}
              </div>

              <div>
                <label className="text-sm text-zinc-400">Tags</label>
                {tagsLoading ? (
                  <p className="text-zinc-500 mt-1">Loading tags...</p>
                ) : expense.tagIds && expense.tagIds.length > 0 ? (
                  expenseTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {expenseTags.map((tag) => (
                        <Badge
                          key={tag.tagId}
                          className="bg-cyan-500/20 text-cyan-300 border-0"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 mt-1">
                      Tags not available. They might have been removed.
                    </p>
                  )
                ) : (
                  <p className="text-zinc-500 mt-1">-</p>
                )}
              </div>

              {expense.receiptUrl && (
                <div>
                  <label className="text-sm text-zinc-400">Receipt</label>
                  <a
                    href={expense.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mt-1"
                  >
                    View Receipt
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Amount Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                <span className="text-zinc-400">Net Amount</span>
                <span className="text-white font-semibold">
                  ${expense.netAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                <span className="text-zinc-400">Tax Amount</span>
                <span className="text-white font-semibold">
                  ${expense.taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-white font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-white">
                  ${expense.totalAmount.toFixed(2)}
                </span>
              </div>

              {expense.budgetOverride &&
                expense.budgetOverride !== BudgetExceptionTypeEnum.NONE && (
                  <div className="pt-4 border-t border-zinc-800">
                    <label className="text-sm text-zinc-400">
                      Budget Override
                    </label>
                    <Badge className="bg-orange-500/20 text-orange-400 border-0 mt-1">
                      {expense.budgetOverride.charAt(0) +
                        expense.budgetOverride.slice(1).toLowerCase()}
                    </Badge>
                    {expense.justification && (
                      <p className="text-sm text-zinc-300 mt-2">
                        {expense.justification}
                      </p>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 flex-wrap">
              {expense.status === ExpenseStatusEnum.DRAFT && (
                <>
                  <Link href={`/expenses/${expense.expenseId}/edit`}>
                    <Button className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Expense
                    </Button>
                  </Link>

                  <Button
                    onClick={() => {
                      setSubmitBudgetOverride(
                        expense.budgetOverride ?? BudgetExceptionTypeEnum.NONE
                      );
                      setSubmitJustification(expense.justification ?? "");
                      setShowSubmitDialog(true);
                    }}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isSubmitting ? (
                      <>
                        <Send className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit for Approval
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}

              {(expense.status === ExpenseStatusEnum.SUBMITTED ||
                expense.status === ExpenseStatusEnum.DRAFT) && (
                <Button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  variant="outline"
                  className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                >
                  {isCancelling ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Expense
                    </>
                  )}
                </Button>
              )}

              {(expense.status === ExpenseStatusEnum.APPROVED ||
                expense.status === ExpenseStatusEnum.REJECTED ||
                expense.status === ExpenseStatusEnum.CANCELLED) && (
                <p className="text-zinc-400 text-sm">
                  This expense is {expense.status.toLowerCase()} and cannot be
                  modified.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-zinc-900 border-zinc-800 max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-white">Confirm Delete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-zinc-300">
                  Are you sure you want to delete this expense? This action
                  cannot be undone.
                </p>
                <div className="flex items-center gap-3 justify-end">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    variant="destructive"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showSubmitDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-zinc-900 border-zinc-800 max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-white">
                  Submit for Approval
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-zinc-300">
                  Are you sure you want to submit this expense for approval? You
                  won't be able to edit it after submission.
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-200">Budget Override</Label>
                    <Select
                      value={submitBudgetOverride}
                      onValueChange={(value) =>
                        setSubmitBudgetOverride(value as BudgetExceptionTypeEnum)
                      }
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Select override" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value={BudgetExceptionTypeEnum.NONE}>
                          No override
                        </SelectItem>
                        <SelectItem value={BudgetExceptionTypeEnum.EMERGENCY}>
                          Emergency
                        </SelectItem>
                        <SelectItem value={BudgetExceptionTypeEnum.ANNUAL}>
                          Annual
                        </SelectItem>
                        <SelectItem value={BudgetExceptionTypeEnum.RECURRING}>
                          Recurring
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-zinc-500">
                      Choose an override type if this expense exceeds the
                      allocated budget.
                    </p>
                  </div>

                  {submitBudgetOverride !== BudgetExceptionTypeEnum.NONE && (
                    <div className="space-y-2">
                      <Label className="text-zinc-200">Justification</Label>
                      <Textarea
                        rows={4}
                        value={submitJustification}
                        onChange={(event) =>
                          setSubmitJustification(event.target.value)
                        }
                        placeholder="Explain why this expense should exceed the budget (minimum 50 characters)"
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                      <p
                        className={`text-xs ${
                          submitJustification.trim().length < 50
                            ? "text-red-400"
                            : "text-zinc-500"
                        }`}
                      >
                        {submitJustification.trim().length}/50 characters
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <Button
                    onClick={() => setShowSubmitDialog(false)}
                    variant="outline"
                    className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
