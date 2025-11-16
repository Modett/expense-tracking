import { apiClient } from "@/lib/api/client";
import {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  SubmitExpenseRequest,
  GetAllExpensesParams,
  PaginatedExpensesResponse,
  ExpensePriorityEnum,
  ExpenseStatusEnum,
  BudgetExceptionTypeEnum,
  ExpenseAggregation,
  ExpenseAggregationParams,
} from "../types";

type ExpenseApiResponse = {
  id?: string;
  expenseId?: string;
  userId: string;
  vendorId: string;
  categoryId: string;
  departmentId?: string | null;
  description: string;
  amountNet?: number;
  netAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  status?: string;
  priority?: string;
  budgetOverride?: string;
  justification?: string | null;
  approvalDeadline?: string | Date | null;
  receiptUrl?: string | null;
  dateOfExpense: string | Date;
  linkedPOId?: string | null;
  linkedPoId?: string | null;
  inventoryDropId?: string | null;
  tagIds?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: Expense["user"];
  vendor?: Expense["vendor"];
  category?: Expense["category"];
  department?: Expense["department"];
};

type GetAllExpensesApiResponse = {
  success: boolean;
  data: {
    expenses: ExpenseApiResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

type ExpenseSuccessResponse = { success: boolean; data: ExpenseApiResponse };

const normalizeDate = (value?: string | Date | null): string => {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
};

const mapStatus = (status?: string): ExpenseStatusEnum => {
  const key = (status || "DRAFT").toUpperCase();
  return (ExpenseStatusEnum as Record<string, ExpenseStatusEnum>)[key] ?? ExpenseStatusEnum.DRAFT;
};

const mapPriority = (priority?: string): ExpensePriorityEnum => {
  const key = (priority || "STANDARD").toUpperCase();
  return (
    (ExpensePriorityEnum as Record<string, ExpensePriorityEnum>)[key] ??
    ExpensePriorityEnum.STANDARD
  );
};

const mapBudgetOverride = (override?: string): BudgetExceptionTypeEnum => {
  const key = (override || "NONE").toUpperCase();
  return (
    (BudgetExceptionTypeEnum as Record<string, BudgetExceptionTypeEnum>)[key] ??
    BudgetExceptionTypeEnum.NONE
  );
};

const mapExpense = (expense: ExpenseApiResponse): Expense => ({
  expenseId: expense.expenseId ?? expense.id ?? "",
  userId: expense.userId,
  vendorId: expense.vendorId,
  categoryId: expense.categoryId,
  departmentId: expense.departmentId ?? undefined,
  description: expense.description,
  netAmount: expense.netAmount ?? expense.amountNet ?? 0,
  taxAmount: expense.taxAmount ?? 0,
  totalAmount: expense.totalAmount ?? 0,
  status: mapStatus(expense.status),
  priority: mapPriority(expense.priority),
  budgetOverride: mapBudgetOverride(expense.budgetOverride),
  justification: expense.justification ?? undefined,
  approvalDeadline: expense.approvalDeadline ? normalizeDate(expense.approvalDeadline) : undefined,
  receiptUrl: expense.receiptUrl ?? undefined,
  dateOfExpense: normalizeDate(expense.dateOfExpense),
  linkedPOId: expense.linkedPoId ?? expense.linkedPOId ?? undefined,
  inventoryDropId: expense.inventoryDropId ?? undefined,
  createdAt: normalizeDate(expense.createdAt),
  updatedAt: normalizeDate(expense.updatedAt),
  user: expense.user,
  vendor: expense.vendor,
  category: expense.category,
  department: expense.department,
});

export const expensesApi = {
  getAll: async (params?: GetAllExpensesParams): Promise<PaginatedExpensesResponse> => {
    const response = await apiClient.get<GetAllExpensesApiResponse>("/expenses", {
      params,
    });

    const payload = response.data.data;

    return {
      data: payload.expenses.map(mapExpense),
      meta: {
        page: payload.pagination.page,
        limit: payload.pagination.limit,
        total: payload.pagination.total,
        totalPages: payload.pagination.totalPages,
      },
    };
  },

  getById: async (expenseId: string): Promise<Expense> => {
    const response = await apiClient.get<ExpenseSuccessResponse>(`/expenses/${expenseId}`);
    return mapExpense(response.data.data);
  },

  create: async (data: CreateExpenseRequest): Promise<Expense> => {
    const response = await apiClient.post<ExpenseSuccessResponse>("/expenses", data);
    return mapExpense(response.data.data);
  },

  update: async (expenseId: string, data: UpdateExpenseRequest): Promise<Expense> => {
    const response = await apiClient.put<ExpenseSuccessResponse>(`/expenses/${expenseId}`, data);
    return mapExpense(response.data.data);
  },

  delete: async (expenseId: string): Promise<void> => {
    await apiClient.delete(`/expenses/${expenseId}`);
  },

  submit: async (expenseId: string, data: SubmitExpenseRequest): Promise<Expense> => {
    const payload = {
      ...data,
      ...(data.budgetOverride && {
        budgetOverride: data.budgetOverride.toLowerCase(),
      }),
    };

    const response = await apiClient.post<ExpenseSuccessResponse>(
      `/expenses/${expenseId}/submit`,
      payload
    );
    return mapExpense(response.data.data);
  },

  cancel: async (expenseId: string): Promise<Expense> => {
    const response = await apiClient.post<ExpenseSuccessResponse>(
      `/expenses/${expenseId}/cancel`
    );
    return mapExpense(response.data.data);
  },

  getAggregations: async (
    params?: ExpenseAggregationParams
  ): Promise<ExpenseAggregation[]> => {
    const query = {
      ...params,
      status: params?.status?.toLowerCase(),
      groupBy: params?.groupBy ? params.groupBy.join(",") : undefined,
    };

    const response = await apiClient.get<{
      success: boolean;
      data: ExpenseAggregation[];
    }>("/expenses/aggregations", { params: query });

    return response.data.data;
  },
};
