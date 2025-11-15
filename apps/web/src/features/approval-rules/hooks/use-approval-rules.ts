import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approvalRulesApi } from "../api";
import {
  CreateApprovalRuleRequest,
  UpdateApprovalRuleRequest,
  GetAllApprovalRulesParams,
} from "../types";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function useApprovalRules(params?: GetAllApprovalRulesParams) {
  return useQuery({
    queryKey: queryKeys.approvalRules.list(params as Record<string, unknown>),
    queryFn: () => approvalRulesApi.getAll(params),
    staleTime: 60000,
  });
}

export function useApprovalRule(ruleId: string) {
  return useQuery({
    queryKey: queryKeys.approvalRules.detail(ruleId),
    queryFn: () => approvalRulesApi.getById(ruleId),
    enabled: !!ruleId,
  });
}

export function useApprovalRulesByCategory(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.approvalRules.byCategory(categoryId),
    queryFn: () => approvalRulesApi.getByCategory(categoryId),
    enabled: !!categoryId,
  });
}

export function useApplicableRules(categoryId: string, amount: number) {
  return useQuery({
    queryKey: queryKeys.approvalRules.applicable(categoryId, amount),
    queryFn: () => approvalRulesApi.getApplicable(categoryId, amount),
    enabled: !!categoryId && amount > 0,
  });
}

export function useCreateApprovalRule() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: approvalRulesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvalRules.all });
      toast({
        title: "Rule created",
        description: "Approval rule has been created successfully",
      });
      router.push("/approval-rules");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create rule",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateApprovalRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: string; data: UpdateApprovalRuleRequest }) =>
      approvalRulesApi.update(ruleId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvalRules.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.approvalRules.detail(data.ruleId),
      });
      toast({
        title: "Rule updated",
        description: "Approval rule has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update rule",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteApprovalRule() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: approvalRulesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvalRules.all });
      toast({
        title: "Rule deleted",
        description: "Approval rule has been deleted successfully",
      });
      router.push("/approval-rules");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete rule",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useActivateApprovalRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approvalRulesApi.activate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvalRules.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.approvalRules.detail(data.ruleId),
      });
      toast({
        title: "Rule activated",
        description: "Approval rule has been activated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to activate rule",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeactivateApprovalRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approvalRulesApi.deactivate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvalRules.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.approvalRules.detail(data.ruleId),
      });
      toast({
        title: "Rule deactivated",
        description: "Approval rule has been deactivated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to deactivate rule",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}
