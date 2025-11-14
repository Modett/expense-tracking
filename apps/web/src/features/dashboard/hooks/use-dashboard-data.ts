import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api";
import { queryKeys } from "@/lib/query/keys";
import {
  DashboardData,
  DashboardStats,
  ExpenseCategoryData,
  PendingTask,
  RecentExpenseItem,
  TeamSpendingData,
} from "../types";

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: queryKeys.dashboard.all,
    queryFn: dashboardApi.getDashboardData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: queryKeys.dashboard.stats,
    queryFn: dashboardApi.getStats,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePendingTasks(options?: { enabled?: boolean }) {
  return useQuery<PendingTask[]>({
    queryKey: queryKeys.dashboard.pendingTasks,
    queryFn: dashboardApi.getPendingTasks,
    staleTime: 1000 * 60 * 2,
    enabled: options?.enabled ?? true,
  });
}

export function useRecentExpenses(
  limit?: number,
  options?: { enabled?: boolean }
) {
  return useQuery<RecentExpenseItem[]>({
    queryKey: queryKeys.dashboard.recentExpenses(limit),
    queryFn: () => dashboardApi.getRecentExpenses(limit),
    staleTime: 1000 * 60 * 2,
    enabled: options?.enabled ?? true,
  });
}

export function useTeamSpending(
  period: string = "monthly",
  options?: { enabled?: boolean }
) {
  return useQuery<TeamSpendingData[]>({
    queryKey: queryKeys.dashboard.teamSpending(period),
    queryFn: () => dashboardApi.getTeamSpending(period),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}

export function useExpensesByCategory(
  period: string = "monthly",
  options?: { enabled?: boolean }
) {
  return useQuery<ExpenseCategoryData[]>({
    queryKey: queryKeys.dashboard.expensesByCategory(period),
    queryFn: () => dashboardApi.getExpensesByCategory(period),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}
