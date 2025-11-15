import { apiClient } from "@/lib/api/client";
import {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  SubmitExpenseRequest,
  GetAllExpensesParams,
  PaginatedExpensesResponse,
} from "../types";

export const expensesApi = {
  getAll: async (params?: GetAllExpensesParams): Promise<PaginatedExpensesResponse> => {
    const response = await apiClient.get<PaginatedExpensesResponse>("/expenses", {
      params,
    });
    return response.data;
  },

  getById: async (expenseId: string): Promise<Expense> => {
    const response = await apiClient.get<{ success: boolean; data: Expense }>(
      `/expenses/${expenseId}`
    );
    return response.data.data;
  },

  create: async (data: CreateExpenseRequest): Promise<Expense> => {
    const response = await apiClient.post<{ success: boolean; data: Expense }>(
      "/expenses",
      data
    );
    return response.data.data;
  },

  update: async (expenseId: string, data: UpdateExpenseRequest): Promise<Expense> => {
    const response = await apiClient.put<{ success: boolean; data: Expense }>(
      `/expenses/${expenseId}`,
      data
    );
    return response.data.data;
  },

  delete: async (expenseId: string): Promise<void> => {
    await apiClient.delete(`/expenses/${expenseId}`);
  },

  submit: async (expenseId: string, data: SubmitExpenseRequest): Promise<Expense> => {
    const response = await apiClient.post<{ success: boolean; data: Expense }>(
      `/expenses/${expenseId}/submit`,
      data
    );
    return response.data.data;
  },

  cancel: async (expenseId: string): Promise<Expense> => {
    const response = await apiClient.post<{ success: boolean; data: Expense }>(
      `/expenses/${expenseId}/cancel`
    );
    return response.data.data;
  },
};
