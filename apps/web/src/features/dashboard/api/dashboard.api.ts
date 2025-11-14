import { apiClient } from "@/lib/api";
import {
  DashboardData,
  DashboardStats,
  ExpenseCategoryData,
  PendingTask,
  RecentExpenseItem,
  TeamSpendingData,
} from "../types";
import { Expense, PaginatedResponse } from "@/types/common.types";

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await apiClient.get<DashboardData>("/approvals/dashboard");
    return response.data;
  },

  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>("/dashboard/stats");
    return response.data;
  },

  getPendingTasks: async (): Promise<PendingTask[]> => {
    const response = await apiClient.get<PendingTask[]>("/dashboard/pending-tasks");
    return response.data;
  },

  getRecentExpenses: async (limit: number = 5): Promise<RecentExpenseItem[]> => {
    const response = await apiClient.get<PaginatedResponse<Expense>>("/expenses", {
      params: {
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    });
    return response.data.data as RecentExpenseItem[];
  },

  getTeamSpending: async (period: string = "monthly"): Promise<TeamSpendingData[]> => {
    const response = await apiClient.get<TeamSpendingData[]>("/dashboard/team-spending", {
      params: { period },
    });
    return response.data;
  },

  getExpensesByCategory: async (period: string = "monthly"): Promise<ExpenseCategoryData[]> => {
    const response = await apiClient.get<ExpenseCategoryData[]>("/dashboard/expenses-by-category", {
      params: { period },
    });
    return response.data;
  },
};
