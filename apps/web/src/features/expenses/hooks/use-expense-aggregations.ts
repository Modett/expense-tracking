import { useQuery } from "@tanstack/react-query";
import { expensesApi } from "../api";
import { ExpenseAggregation, ExpenseAggregationParams } from "../types";
import { queryKeys } from "@/lib/query/keys";

export function useExpenseAggregations(
  params?: ExpenseAggregationParams,
  options?: { enabled?: boolean }
) {
  return useQuery<ExpenseAggregation[]>({
    queryKey: queryKeys.expenses.aggregations((params ?? {}) as Record<string, unknown>),
    queryFn: () => expensesApi.getAggregations(params),
    staleTime: 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
