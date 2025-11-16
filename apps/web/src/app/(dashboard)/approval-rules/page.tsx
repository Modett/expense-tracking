"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useApprovalRules,
  useDeleteApprovalRule,
  useActivateApprovalRule,
  useDeactivateApprovalRule,
  ApproverRoleEnum,
} from "@/features/approval-rules";
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
  Shield,
} from "lucide-react";

export default function ApprovalRulesPage() {
  const [roleFilter, setRoleFilter] = useState<ApproverRoleEnum | "ALL">("ALL");
  const [activeFilter, setActiveFilter] = useState<string | "ALL">("ALL");

  const { data: allRules, isLoading, error, isError } = useApprovalRules();
  const deleteRuleMutation = useDeleteApprovalRule();
  const activateRuleMutation = useActivateApprovalRule();
  const deactivateRuleMutation = useDeactivateApprovalRule();

  // Debug logging
  console.log("Approval Rules Data:", { allRules, isLoading, isError, error });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    ruleId: string | null;
  }>({
    open: false,
    ruleId: null,
  });

  const handleDelete = () => {
    if (deleteDialog.ruleId) {
      deleteRuleMutation.mutate(deleteDialog.ruleId, {
        onSuccess: () => setDeleteDialog({ open: false, ruleId: null }),
      });
    }
  };

  const handleToggleActive = (ruleId: string, isActive: boolean) => {
    if (isActive) {
      deactivateRuleMutation.mutate(ruleId);
    } else {
      activateRuleMutation.mutate(ruleId);
    }
  };

  const getRoleBadge = (role: ApproverRoleEnum | `${ApproverRoleEnum}`) => {
    const roleConfig = {
      [ApproverRoleEnum.STAFF]: {
        label: "Staff",
        className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      },
      [ApproverRoleEnum.MANAGER]: {
        label: "Manager",
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      },
      [ApproverRoleEnum.FINANCE]: {
        label: "Finance",
        className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      },
      [ApproverRoleEnum.ADMIN]: {
        label: "Admin",
        className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      },
    };

    const config = roleConfig[role as ApproverRoleEnum];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Approval Rules</h1>
          <p className="text-zinc-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Approval Rules</h1>
          <p className="text-red-400 mt-2">
            Error loading approval rules: {error?.toString()}
          </p>
          <pre className="text-xs text-zinc-400 mt-4">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  const filteredRules =
    allRules?.filter((rule) => {
      if (roleFilter !== "ALL" && rule.approverRole !== roleFilter)
        return false;
      if (activeFilter === "active" && !rule.isActive) return false;
      if (activeFilter === "inactive" && rule.isActive) return false;
      return true;
    }) || [];

  const rulesByCategory = filteredRules.reduce(
    (acc, rule) => {
      const categoryName = rule.category?.name || "Unknown";
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(rule);
      return acc;
    },
    {} as Record<string, typeof filteredRules>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Approval Rules</h1>
            <p className="text-zinc-400 mt-2">
              Configure approval workflows by category and amount
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/approval-rules/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Select
          value={roleFilter}
          onValueChange={(value) =>
            setRoleFilter(value as ApproverRoleEnum | "ALL")
          }
        >
          <SelectTrigger className="w-48 bg-zinc-900 border-zinc-800 text-white">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value={ApproverRoleEnum.STAFF}>Staff</SelectItem>
            <SelectItem value={ApproverRoleEnum.MANAGER}>Manager</SelectItem>
            <SelectItem value={ApproverRoleEnum.FINANCE}>Finance</SelectItem>
            <SelectItem value={ApproverRoleEnum.ADMIN}>Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-48 bg-zinc-900 border-zinc-800 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {Object.entries(rulesByCategory).length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
          <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Approval Rules
          </h3>
          <p className="text-zinc-400 mb-4">
            Create your first approval rule to get started
          </p>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/approval-rules/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(rulesByCategory).map(([categoryName, rules]) => (
            <Card key={categoryName} className="bg-zinc-900 border-zinc-800">
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-xl font-semibold text-white">
                  {categoryName}
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  {rules.length} rule{rules.length !== 1 ? "s" : ""} configured
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-900">
                    <TableHead className="text-zinc-400">
                      Minimum Amount
                    </TableHead>
                    <TableHead className="text-zinc-400">
                      Approver Role
                    </TableHead>
                    <TableHead className="text-zinc-400">
                      Approval Order
                    </TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules
                    .sort((a, b) => a.approvalOrder - b.approvalOrder)
                    .map((rule) => (
                      <TableRow
                        key={rule.ruleId}
                        className="border-zinc-800 hover:bg-zinc-800/50"
                      >
                        <TableCell className="text-white font-mono">
                          ${Number(rule.minAmount).toFixed(2)}+
                        </TableCell>
                        <TableCell>{getRoleBadge(rule.approverRole)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-zinc-800 text-zinc-300 border-zinc-700"
                          >
                            Level {rule.approvalOrder}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {rule.isActive ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500 border-green-500/20"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-gray-500/10 text-gray-400 border-gray-500/20"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className={
                                rule.isActive
                                  ? "text-gray-500 hover:text-gray-400 hover:bg-gray-500/10"
                                  : "text-green-500 hover:text-green-400 hover:bg-green-500/10"
                              }
                              onClick={() =>
                                handleToggleActive(rule.ruleId, rule.isActive)
                              }
                            >
                              {rule.isActive ? (
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
                              <Link
                                href={`/approval-rules/${rule.ruleId}/edit`}
                              >
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
                                  ruleId: rule.ruleId,
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, ruleId: null })}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Approval Rule</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete this approval rule? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialog({ open: false, ruleId: null })}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteRuleMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              {deleteRuleMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
