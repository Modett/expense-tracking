import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { budgetsApi } from "../api";
import {
  CreateBudgetRequest,
  UpdateBudgetRequest,
  AdjustBudgetSpentRequest,
  GetAllBudgetsParams,
} from "../types";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function useBudgets(params?: GetAllBudgetsParams) {
  return useQuery({
    queryKey: queryKeys.budgets.list(params as Record<string, unknown>),
    queryFn: () => budgetsApi.getAll(params),
    staleTime: 30000,
  });
}

export function useBudget(budgetId: string) {
  return useQuery({
    queryKey: queryKeys.budgets.detail(budgetId),
    queryFn: () => budgetsApi.getById(budgetId),
    enabled: !!budgetId,
  });
}

export function useBudgetsByDepartment(departmentId: string) {
  return useQuery({
    queryKey: ["budgets", "department", departmentId],
    queryFn: () => budgetsApi.getByDepartment(departmentId),
    enabled: !!departmentId,
  });
}

export function useBudgetStatus(
  departmentId: string,
  categoryId: string | null,
  fiscalPeriod: string
) {
  return useQuery({
    queryKey: ["budgets", "status", departmentId, categoryId, fiscalPeriod],
    queryFn: () => budgetsApi.getStatus(departmentId, categoryId, fiscalPeriod),
    enabled: !!departmentId && !!fiscalPeriod,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: budgetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      toast({
        title: "Budget created",
        description: "Budget has been created successfully",
      });
      router.push("/budgets");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create budget",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      budgetId,
      data,
    }: {
      budgetId: string;
      data: UpdateBudgetRequest;
    }) => budgetsApi.update(budgetId, data),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.detail(data.budgetId),
      });
      toast({
        title: "Budget updated",
        description: "Budget has been updated successfully",
      });
      router.push("/budgets");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Please try again";
      console.error("Failed to update budget:", error.response?.data || error);
      toast({
        title: "Failed to update budget",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useAdjustBudgetSpent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      budgetId,
      data,
    }: {
      budgetId: string;
      data: AdjustBudgetSpentRequest;
    }) => budgetsApi.adjustSpent(budgetId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.detail(data.budgetId),
      });
      toast({
        title: "Budget adjusted",
        description: "Budget spent amount has been adjusted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to adjust budget",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useActivateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetsApi.activate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.detail(data.budgetId),
      });
      toast({
        title: "Budget activated",
        description: "Budget has been activated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to activate budget",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeactivateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetsApi.deactivate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.detail(data.budgetId),
      });
      toast({
        title: "Budget deactivated",
        description: "Budget has been deactivated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to deactivate budget",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: budgetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      toast({
        title: "Budget deleted",
        description: "Budget has been deleted successfully",
      });
      router.push("/budgets");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete budget",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}
