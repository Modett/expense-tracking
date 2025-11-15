import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "../api";
import {
  UpdateExpenseRequest,
  SubmitExpenseRequest,
  GetAllExpensesParams,
} from "../types";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function useExpenses(params?: GetAllExpensesParams) {
  return useQuery({
    queryKey: queryKeys.expenses.list(params as Record<string, unknown>),
    queryFn: () => expensesApi.getAll(params),
    staleTime: 30000,
  });
}

export function useExpense(expenseId: string) {
  return useQuery({
    queryKey: queryKeys.expenses.detail(expenseId),
    queryFn: () => expensesApi.getById(expenseId),
    enabled: !!expenseId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: expensesApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      toast({
        title: "Expense created",
        description: "Your expense has been created successfully",
      });
      router.push(`/expenses/${data.expenseId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create expense",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, data }: { expenseId: string; data: UpdateExpenseRequest }) =>
      expensesApi.update(expenseId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.detail(data.expenseId),
      });
      toast({
        title: "Expense updated",
        description: "Your expense has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update expense",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      toast({
        title: "Expense deleted",
        description: "Your expense has been deleted successfully",
      });
      router.push("/expenses");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete expense",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useSubmitExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, data }: { expenseId: string; data: SubmitExpenseRequest }) =>
      expensesApi.submit(expenseId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.detail(data.expenseId),
      });
      toast({
        title: "Expense submitted",
        description: "Your expense has been submitted for approval",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit expense",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useCancelExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expensesApi.cancel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.detail(data.expenseId),
      });
      toast({
        title: "Expense cancelled",
        description: "Your expense has been cancelled",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel expense",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}
