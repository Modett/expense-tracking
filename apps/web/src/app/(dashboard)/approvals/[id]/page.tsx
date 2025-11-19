"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApproval, useApprovalsByExpense, useApproveApproval, useRejectApproval, ApprovalStatusEnum } from "@/features/approvals";
import { ApprovalChain } from "@/features/approvals/components";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, ArrowLeft, AlertCircle, Calendar, DollarSign, User, Building2, FileText, CheckCircle2 } from "lucide-react";

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const approvalId = params.id as string;

  const { data: approval, isLoading } = useApproval(approvalId);
  const { data: allApprovals } = useApprovalsByExpense(approval?.expenseId || "");
  const approveApprovalMutation = useApproveApproval();
  const rejectApprovalMutation = useRejectApproval();

  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [comments, setComments] = useState("");

  const handleApprove = () => {
    approveApprovalMutation.mutate(
      { approvalId, data: comments ? { comments } : undefined },
      {
        onSuccess: () => {
          setApproveDialog(false);
          setComments("");
          router.push("/approvals");
        },
      }
    );
  };

  const handleReject = () => {
    rejectApprovalMutation.mutate(
      { approvalId, data: comments ? { comments } : undefined },
      {
        onSuccess: () => {
          setRejectDialog(false);
          setComments("");
          router.push("/approvals");
        },
      }
    );
  };

  const getStatusBadge = (status: ApprovalStatusEnum) => {
    const statusConfig = {
      [ApprovalStatusEnum.PENDING]: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
      [ApprovalStatusEnum.WAITING]: { label: "Waiting", className: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
      [ApprovalStatusEnum.APPROVED]: { label: "Approved", className: "bg-green-500/10 text-green-500 border-green-500/20" },
      [ApprovalStatusEnum.REJECTED]: { label: "Rejected", className: "bg-red-500/10 text-red-500 border-red-500/20" },
      [ApprovalStatusEnum.SKIPPED]: { label: "Skipped", className: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
    };

    const config = statusConfig[status] || statusConfig[ApprovalStatusEnum.PENDING];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  if (isLoading || !approval) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Loading...</h1>
        </div>
      </div>
    );
  }

  const expense = approval.expense;
  const isPending = approval.status === ApprovalStatusEnum.PENDING;

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Approval Details</h1>
            <p className="text-muted-foreground mt-2">Review expense details and approval chain</p>
          </div>
          {isPending && (
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="border border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                onClick={() => setRejectDialog(true)}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                onClick={() => setApproveDialog(true)}
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total Amount</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            ${expense?.totalAmount ? Number(expense.totalAmount).toFixed(2) : "0.00"}
          </p>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Submitted Date</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {expense?.dateOfExpense ? new Date(expense.dateOfExpense).toLocaleDateString() : "N/A"}
          </p>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Approval Level</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Level {approval.approvalOrder}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="bg-card border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Expense Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Description</label>
                <p className="text-foreground mt-1">{expense?.description || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Category</label>
                  <p className="text-foreground mt-1">{expense?.category?.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Vendor</label>
                  <p className="text-foreground mt-1">{expense?.vendor?.name || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Net Amount</label>
                  <p className="text-foreground mt-1 font-mono">
                    ${expense?.amountNet ? Number(expense.amountNet).toFixed(2) : "0.00"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Tax Amount</label>
                  <p className="text-foreground mt-1 font-mono">
                    ${expense?.taxAmount ? Number(expense.taxAmount).toFixed(2) : "0.00"}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Submitted By</label>
                <div className="mt-1">
                  <p className="text-foreground">{expense?.user?.name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{expense?.user?.email}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Approval Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Approver</label>
                <div className="mt-1">
                  <p className="text-foreground">{approval.approver?.name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{approval.approver?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <div className="mt-2">{getStatusBadge(approval.status)}</div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Approval Order</label>
                  <p className="text-foreground mt-2">Level {approval.approvalOrder}</p>
                </div>
              </div>
              {approval.comments && (
                <div>
                  <label className="text-sm text-muted-foreground">Comments</label>
                  <p className="text-foreground mt-1 p-3 bg-muted rounded-lg">{approval.comments}</p>
                </div>
              )}
              {approval.approvedAt && (
                <div>
                  <label className="text-sm text-muted-foreground">Approved At</label>
                  <p className="text-foreground mt-1">
                    {new Date(approval.approvedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <ApprovalChain approvals={allApprovals || []} />

          <Card className="bg-card border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
                asChild
              >
                <Link href={`/expenses/${expense?.expenseId}`}>
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Expense Details
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Approve Expense</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You are about to approve this expense. Optionally add comments for your approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="approve-comments" className="text-muted-foreground">
                Comments (Optional)
              </Label>
              <Textarea
                id="approve-comments"
                placeholder="Add any comments about your approval decision..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="bg-muted border-border text-foreground mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setApproveDialog(false);
                setComments("");
              }}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveApprovalMutation.isPending}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {approveApprovalMutation.isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Reject Expense</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You are about to reject this expense. Please provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reject-comments" className="text-muted-foreground">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reject-comments"
                placeholder="Please explain why you are rejecting this expense..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="bg-muted border-border text-foreground mt-2"
                rows={4}
              />
            </div>
            {!comments && (
              <div className="flex items-center gap-2 text-amber-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Adding comments is recommended when rejecting</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setRejectDialog(false);
                setComments("");
              }}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejectApprovalMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              {rejectApprovalMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

