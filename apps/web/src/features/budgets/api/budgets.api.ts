import { apiClient } from "@/lib/api/client";
import {
  Budget,
  BudgetEnforcementType,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  AdjustBudgetSpentRequest,
  GetAllBudgetsParams,
  BudgetStatus,
  CreateBudgetResponse,
  AdjustBudgetSpentResponse,
} from "../types";

type BudgetApiResponse = {
  id?: string;
  budgetId?: string;
  departmentId?: string | null;
  categoryId?: string | null;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount?: number;
  utilizationPercentage?: number;
  fiscalPeriod: string;
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
  enforcementType?: string;
  overrideAllowed?: boolean;
  warningThreshold1?: number;
  warningThreshold2?: number;
  criticalThreshold?: number;
  thresholds?: {
    warning1?: number;
    warning2?: number;
    critical?: number;
  };
  exceededThreshold?: { level: string; threshold: number } | null;
  isOverBudget?: boolean;
  isNearLimit?: boolean;
  isExhausted?: boolean;
  isPeriodActive?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  department?: Budget["department"];
  category?: Budget["category"];
};

const normalizeDate = (value: string | Date): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

const mapEnforcementType = (value?: string): BudgetEnforcementType => {
  const normalized = (value ?? BudgetEnforcementType.SOFT).toUpperCase();
  return normalized === BudgetEnforcementType.HARD.toUpperCase()
    ? BudgetEnforcementType.HARD
    : BudgetEnforcementType.SOFT;
};

const mapThresholds = (budget: BudgetApiResponse): Budget["thresholds"] => ({
  warning1: budget.thresholds?.warning1 ?? budget.warningThreshold1 ?? 80,
  warning2: budget.thresholds?.warning2 ?? budget.warningThreshold2 ?? 90,
  critical: budget.thresholds?.critical ?? budget.criticalThreshold ?? 100,
});

const toArray = (value: unknown): BudgetApiResponse[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray((value as any)?.budgets)) {
    return (value as any).budgets;
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, BudgetApiResponse>);
  }

  return [];
};

const getPayload = (response: unknown): BudgetApiResponse[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray((response as any).data)) return (response as any).data;
  if ((response as any).data) return toArray((response as any).data);
  return toArray(response);
};

const mapBudget = (budget: BudgetApiResponse): Budget => {
  const thresholds = mapThresholds(budget);
  const budgetAmount = Number(budget.budgetAmount ?? 0);
  const spentAmount = Number(budget.spentAmount ?? 0);
  const remainingAmount =
    budget.remainingAmount !== undefined
      ? Number(budget.remainingAmount)
      : Math.max(budgetAmount - spentAmount, 0);

  return {
    budgetId: budget.budgetId ?? budget.id ?? "",
    departmentId: budget.departmentId ?? null,
    categoryId: budget.categoryId ?? undefined,
    budgetAmount,
    spentAmount,
    remainingAmount,
    utilizationPercentage: budget.utilizationPercentage ?? 0,
    fiscalPeriod: budget.fiscalPeriod,
    startDate: normalizeDate(budget.startDate),
    endDate: normalizeDate(budget.endDate),
    isActive: Boolean(budget.isActive),
    enforcementType: mapEnforcementType(budget.enforcementType),
    overrideAllowed: budget.overrideAllowed ?? true,
    warningThreshold1: thresholds.warning1,
    warningThreshold2: thresholds.warning2,
    criticalThreshold: thresholds.critical,
    thresholds,
    exceededThreshold: budget.exceededThreshold ?? null,
    isOverBudget: budget.isOverBudget ?? false,
    isNearLimit: budget.isNearLimit ?? false,
    isExhausted: budget.isExhausted ?? false,
    isPeriodActive: budget.isPeriodActive ?? false,
    createdAt: normalizeDate(budget.createdAt),
    updatedAt: normalizeDate(budget.updatedAt),
    department: budget.department,
    category: budget.category ?? null,
  };
};

export const budgetsApi = {
  getAll: async (params?: GetAllBudgetsParams): Promise<Budget[]> => {
    const response = await apiClient.get("/budgets", { params });
    return getPayload(response.data).map(mapBudget);
  },

  getById: async (budgetId: string): Promise<Budget> => {
    const response = await apiClient.get(`/budgets/${budgetId}`);
    const payload =
      (response.data && response.data.data) ?? response.data ?? {};
    return mapBudget(payload as BudgetApiResponse);
  },

  getByDepartment: async (departmentId: string): Promise<Budget[]> => {
    const response = await apiClient.get(`/budgets/department/${departmentId}`);
    return getPayload(response.data).map(mapBudget);
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
    const payload = {
      ...data,
      departmentId: data.departmentId || null,
    };
    const response = await apiClient.post<{ success: boolean; data: CreateBudgetResponse }>(
      "/budgets",
      payload
    );
    return response.data.data;
  },

  update: async (budgetId: string, data: UpdateBudgetRequest): Promise<Budget> => {
    const payload: UpdateBudgetRequest = {
      ...data,
      enforcementType: data.enforcementType?.toLowerCase() as UpdateBudgetRequest["enforcementType"],
    };

    const response = await apiClient.patch<{ success: boolean; data: { budgetId: string } }>(
      `/budgets/${budgetId}`,
      payload
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
