"use client";

import { useState } from "react";
import Link from "next/link";
import { usePendingApprovals, useApproveApproval, useRejectApproval } from "@/features/approvals";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Eye, Clock, AlertCircle } from "lucide-react";
import { ApprovalStatusEnum } from "@/features/approvals/types";

export default function PendingApprovalsPage() {
  const { data: approvals, isLoading } = usePendingApprovals();
  const approveApprovalMutation = useApproveApproval();
  const rejectApprovalMutation = useRejectApproval();

  const [approveDialog, setApproveDialog] = useState<{ open: boolean; approvalId: string | null }>({
    open: false,
    approvalId: null,
  });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; approvalId: string | null }>({
    open: false,
    approvalId: null,
  });
  const [comments, setComments] = useState("");

  const handleApprove = () => {
    if (approveDialog.approvalId) {
      approveApprovalMutation.mutate(
        { approvalId: approveDialog.approvalId, data: comments ? { comments } : undefined },
        {
          onSuccess: () => {
            setApproveDialog({ open: false, approvalId: null });
            setComments("");
          },
        }
      );
    }
  };

  const handleReject = () => {
    if (rejectDialog.approvalId) {
      rejectApprovalMutation.mutate(
        { approvalId: rejectDialog.approvalId, data: comments ? { comments } : undefined },
        {
          onSuccess: () => {
            setRejectDialog({ open: false, approvalId: null });
            setComments("");
          },
        }
      );
    }
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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Pending Approvals</h1>
          <p className="text-zinc-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const pendingApprovals = approvals?.filter(a => a.status === ApprovalStatusEnum.PENDING) || [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Pending Approvals</h1>
        <p className="text-zinc-400 mt-2">
          Review and approve expense requests awaiting your action
        </p>
      </div>

      {pendingApprovals.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
          <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Pending Approvals</h3>
          <p className="text-zinc-400">You have no expenses waiting for your approval</p>
        </Card>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900">
                <TableHead className="text-zinc-400">Expense</TableHead>
                <TableHead className="text-zinc-400">Submitted By</TableHead>
                <TableHead className="text-zinc-400">Amount</TableHead>
                <TableHead className="text-zinc-400">Priority</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Order</TableHead>
                <TableHead className="text-zinc-400">Submitted</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApprovals.map((approval) => (
                <TableRow key={approval.approvalId} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell>
                    <div className="max-w-xs">
                      <Link
                        href={`/expenses/${approval.expenseId}`}
                        className="text-white hover:text-purple-400 font-medium line-clamp-1"
                      >
                        {approval.expense?.description || "N/A"}
                      </Link>
                      <div className="text-sm text-zinc-500 mt-1">
                        {approval.expense?.category?.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-white">{approval.expense?.user?.name || "Unknown"}</div>
                    <div className="text-sm text-zinc-500">{approval.expense?.user?.email}</div>
                  </TableCell>
                  <TableCell className="text-white font-mono">
                    ${approval.expense?.totalAmount ? Number(approval.expense.totalAmount).toFixed(2) : "0.00"}
                  </TableCell>
                  <TableCell>{getPriorityBadge(approval.expense?.priority || "standard")}</TableCell>
                  <TableCell>{getStatusBadge(approval.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                      Level {approval.approvalOrder}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {new Date(approval.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                        asChild
                      >
                        <Link href={`/approvals/${approval.approvalId}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        onClick={() => setApproveDialog({ open: true, approvalId: approval.approvalId })}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => setRejectDialog({ open: true, approvalId: approval.approvalId })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ open, approvalId: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Approve Expense</DialogTitle>
            <DialogDescription className="text-zinc-400">
              You are about to approve this expense. Optionally add comments for your approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="approve-comments" className="text-zinc-300">
                Comments (Optional)
              </Label>
              <Textarea
                id="approve-comments"
                placeholder="Add any comments about your approval decision..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setApproveDialog({ open: false, approvalId: null });
                setComments("");
              }}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
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

      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, approvalId: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Reject Expense</DialogTitle>
            <DialogDescription className="text-zinc-400">
              You are about to reject this expense. Please provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reject-comments" className="text-zinc-300">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reject-comments"
                placeholder="Please explain why you are rejecting this expense..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white mt-2"
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
                setRejectDialog({ open: false, approvalId: null });
                setComments("");
              }}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
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
