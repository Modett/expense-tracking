"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, Clock, ChevronDown, MessageSquare } from "lucide-react";
import { ApprovalStatusEnum } from "../types";
import type { Approval } from "../types";
import { cn } from "@/lib/utils";

interface ApprovalChainProps {
  approvals: Approval[];
  className?: string;
}

export function ApprovalChain({ approvals, className }: ApprovalChainProps) {
  // Sort approvals by order
  const sortedApprovals = [...approvals].sort((a, b) => a.approvalOrder - b.approvalOrder);

  const getStatusIcon = (status: ApprovalStatusEnum) => {
    switch (status) {
      case ApprovalStatusEnum.APPROVED:
        return <Check className="w-5 h-5 text-green-500" />;
      case ApprovalStatusEnum.REJECTED:
        return <X className="w-5 h-5 text-red-500" />;
      case ApprovalStatusEnum.PENDING:
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case ApprovalStatusEnum.WAITING:
      case ApprovalStatusEnum.SKIPPED:
        return <Clock className="w-5 h-5 text-zinc-500" />;
      default:
        return <Clock className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getStatusColor = (status: ApprovalStatusEnum) => {
    switch (status) {
      case ApprovalStatusEnum.APPROVED:
        return "border-green-500/30 bg-green-500/5";
      case ApprovalStatusEnum.REJECTED:
        return "border-red-500/30 bg-red-500/5";
      case ApprovalStatusEnum.PENDING:
        return "border-yellow-500/30 bg-yellow-500/5";
      case ApprovalStatusEnum.WAITING:
        return "border-zinc-700 bg-zinc-900/50";
      case ApprovalStatusEnum.SKIPPED:
        return "border-zinc-700 bg-zinc-800/50";
      default:
        return "border-zinc-700 bg-zinc-900/50";
    }
  };

  const getStatusBadge = (status: ApprovalStatusEnum) => {
    const statusConfig = {
      [ApprovalStatusEnum.PENDING]: {
        label: "Pending",
        className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      },
      [ApprovalStatusEnum.WAITING]: {
        label: "Waiting",
        className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      },
      [ApprovalStatusEnum.APPROVED]: {
        label: "Approved",
        className: "bg-green-500/10 text-green-500 border-green-500/20",
      },
      [ApprovalStatusEnum.REJECTED]: {
        label: "Rejected",
        className: "bg-red-500/10 text-red-500 border-red-500/20",
      },
      [ApprovalStatusEnum.SKIPPED]: {
        label: "Skipped",
        className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      },
    };

    const config = statusConfig[status] || statusConfig[ApprovalStatusEnum.PENDING];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return null;
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className={cn("bg-zinc-900 border-zinc-800 p-6", className)}>
      <h3 className="text-lg font-semibold text-white mb-6">Approval Chain</h3>

      <div className="space-y-4">
        {sortedApprovals.map((approval, index) => (
          <div key={approval.approvalId}>
            <div
              className={cn(
                "relative rounded-lg border-2 p-4 transition-all",
                getStatusColor(approval.status)
              )}
            >
              {/* Approval Step Header */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-zinc-700">
                      <AvatarFallback className="bg-zinc-800 text-zinc-300">
                        {getInitials(approval.approver?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-zinc-900 p-1">
                      {getStatusIcon(approval.status)}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h4 className="text-white font-medium">
                        {approval.approver?.name || "Unknown Approver"}
                      </h4>
                      <p className="text-sm text-zinc-500">
                        {approval.approverRole || "Approver"} - Level {approval.approvalOrder}
                      </p>
                    </div>
                    {getStatusBadge(approval.status)}
                  </div>

                  {/* Timestamps */}
                  {approval.status === ApprovalStatusEnum.APPROVED && approval.approvedAt && (
                    <div className="text-xs text-green-500/80 mt-2">
                      Approved on {formatDate(approval.approvedAt)}
                    </div>
                  )}
                  {approval.status === ApprovalStatusEnum.REJECTED && approval.rejectedAt && (
                    <div className="text-xs text-red-500/80 mt-2">
                      Rejected on {formatDate(approval.rejectedAt)}
                    </div>
                  )}

                  {/* Comments */}
                  {approval.comments && (
                    <div className="mt-3 rounded-md bg-zinc-800/50 p-3 border border-zinc-700/50">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-zinc-400 mb-1">Comments:</p>
                          <p className="text-sm text-zinc-300">{approval.comments}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Connector Line */}
            {index < sortedApprovals.length - 1 && (
              <div className="flex justify-center py-2">
                <ChevronDown className="w-5 h-5 text-zinc-600" />
              </div>
            )}
          </div>
        ))}
      </div>

      {sortedApprovals.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500">No approval steps configured</p>
        </div>
      )}
    </Card>
  );
}
