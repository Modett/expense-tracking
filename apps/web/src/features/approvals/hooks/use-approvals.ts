import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approvalsApi } from "../api";
import {
  ApproveApprovalRequest,
  RejectApprovalRequest,
  UpdateApprovalRequest,
  GetAllApprovalsParams,
  GetRejectedApprovalsParams,
} from "../types";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/components/ui/use-toast";

export function useApprovals(params?: GetAllApprovalsParams) {
  return useQuery({
    queryKey: queryKeys.approvals.list(params as Record<string, unknown>),
    queryFn: () => approvalsApi.getAll(params),
    staleTime: 30000,
  });
}

export function usePendingApprovals(approverId?: string) {
  return useQuery({
    queryKey: queryKeys.approvals.pending,
    queryFn: () => approvalsApi.getPending(approverId),
    staleTime: 10000,
  });
}

export function useApproval(approvalId: string) {
  return useQuery({
    queryKey: queryKeys.approvals.detail(approvalId),
    queryFn: () => approvalsApi.getById(approvalId),
    enabled: !!approvalId,
  });
}

export function useApprovalsByExpense(expenseId: string) {
  return useQuery({
    queryKey: queryKeys.approvals.byExpense(expenseId),
    queryFn: () => approvalsApi.getByExpense(expenseId),
    enabled: !!expenseId,
  });
}

export function useApprovalsByApprover(approverId: string) {
  return useQuery({
    queryKey: queryKeys.approvals.byApprover(approverId),
    queryFn: () => approvalsApi.getByApprover(approverId),
    enabled: !!approverId,
  });
}

export function useRejectedApprovalsVisible(params?: GetRejectedApprovalsParams) {
  return useQuery({
    queryKey: queryKeys.approvals.rejectedVisible(params as Record<string, unknown>),
    queryFn: () => approvalsApi.getRejectedVisible(params),
    staleTime: 60000,
  });
}

export function useApprovalDashboard() {
  return useQuery({
    queryKey: queryKeys.approvals.dashboard,
    queryFn: () => approvalsApi.getDashboard(),
    staleTime: 30000,
  });
}

export function useApproveApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ approvalId, data }: { approvalId: string; data?: ApproveApprovalRequest }) =>
      approvalsApi.approve(approvalId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      const message = response.purchaseOrderCreated
        ? `Approval approved successfully. Purchase Order #${response.purchaseOrderId} has been created.`
        : "Approval approved successfully";

      toast({
        title: "Approved",
        description: message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to approve",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useRejectApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ approvalId, data }: { approvalId: string; data?: RejectApprovalRequest }) =>
      approvalsApi.reject(approvalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      toast({
        title: "Rejected",
        description: "Approval rejected successfully",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reject",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ approvalId, data }: { approvalId: string; data: UpdateApprovalRequest }) =>
      approvalsApi.update(approvalId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.approvals.detail(data.approvalId),
      });

      toast({
        title: "Updated",
        description: "Approval comments updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}
