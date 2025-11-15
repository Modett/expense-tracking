import { apiClient } from "@/lib/api/client";
import {
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  AdjustBudgetSpentRequest,
  GetAllBudgetsParams,
  BudgetStatus,
  CreateBudgetResponse,
  AdjustBudgetSpentResponse,
} from "../types";

export const budgetsApi = {
  getAll: async (params?: GetAllBudgetsParams): Promise<Budget[]> => {
    const response = await apiClient.get<{ success: boolean; data: Budget[] }>(
      "/budgets",
      { params }
    );
    return response.data.data;
  },

  getById: async (budgetId: string): Promise<Budget> => {
    const response = await apiClient.get<{ success: boolean; data: Budget }>(
      `/budgets/${budgetId}`
    );
    return response.data.data;
  },

  getByDepartment: async (departmentId: string): Promise<Budget[]> => {
    const response = await apiClient.get<{ success: boolean; data: Budget[] }>(
      `/budgets/department/${departmentId}`
    );
    return response.data.data;
  },

  getStatus: async (
    departmentId: string,
    categoryId: string | null,
    fiscalPeriod: string
  ): Promise<BudgetStatus> => {
    const response = await apiClient.get<{ success: boolean; data: BudgetStatus }>(
      "/budgets/status",
      { params: { departmentId, categoryId, fiscalPeriod } }
    );
    return response.data.data;
  },

  create: async (data: CreateBudgetRequest): Promise<CreateBudgetResponse> => {
    const response = await apiClient.post<{ success: boolean; data: CreateBudgetResponse }>(
      "/budgets",
      data
    );
    return response.data.data;
  },

  update: async (budgetId: string, data: UpdateBudgetRequest): Promise<Budget> => {
    const response = await apiClient.patch<{ success: boolean; data: { budgetId: string } }>(
      `/budgets/${budgetId}`,
      data
    );
    return budgetsApi.getById(budgetId);
  },

  adjustSpent: async (
    budgetId: string,
    data: AdjustBudgetSpentRequest
  ): Promise<AdjustBudgetSpentResponse> => {
    const response = await apiClient.post<{ success: boolean; data: AdjustBudgetSpentResponse }>(
      `/budgets/${budgetId}/adjust-spent`,
      data
    );
    return response.data.data;
  },

  activate: async (budgetId: string): Promise<Budget> => {
    const response = await apiClient.post<{ success: boolean; data: Budget }>(
      `/budgets/${budgetId}/activate`
    );
    return response.data.data;
  },

  deactivate: async (budgetId: string): Promise<Budget> => {
    const response = await apiClient.post<{ success: boolean; data: Budget }>(
      `/budgets/${budgetId}/deactivate`
    );
    return response.data.data;
  },

  delete: async (budgetId: string): Promise<void> => {
    await apiClient.delete(`/budgets/${budgetId}`);
  },
};
