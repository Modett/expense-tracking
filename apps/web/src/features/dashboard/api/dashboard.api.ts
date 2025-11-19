import { apiClient } from "@/lib/api";
import {
  DashboardData,
  DashboardStats,
  ExpenseCategoryData,
  PendingTask,
  RecentExpenseItem,
  TeamSpendingData,
} from "../types";
import { Expense } from "@/types/common.types";

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await apiClient.get<{ success: boolean; data: DashboardData }>("/approvals/dashboard");
    return response.data.data;
  },

  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>("/dashboard/stats");
    return response.data.data;
  },

  getPendingTasks: async (): Promise<PendingTask[]> => {
    const response = await apiClient.get<{ success: boolean; data: PendingTask[] }>("/dashboard/pending-tasks");
    return response.data.data;
  },

  getRecentExpenses: async (limit: number = 5): Promise<RecentExpenseItem[]> => {
    const response = await apiClient.get<{ success: boolean; data: { expenses: Expense[]; pagination: any } }>("/expenses", {
      params: {
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    });
    return (response.data.data?.expenses || []) as RecentExpenseItem[];
  },

  getTeamSpending: async (period: string = "monthly"): Promise<TeamSpendingData[]> => {
    const response = await apiClient.get<{ success: boolean; data: TeamSpendingData[] }>("/dashboard/team-spending", {
      params: { period },
    });
    return response.data.data;
  },

  getExpensesByCategory: async (period: string = "monthly"): Promise<ExpenseCategoryData[]> => {
    const response = await apiClient.get<{ success: boolean; data: ExpenseCategoryData[] }>("/dashboard/expenses-by-category", {
      params: { period },
    });
    return response.data.data;
  },
};
