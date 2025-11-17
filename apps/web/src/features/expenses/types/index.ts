import { User, Category, Department, Vendor } from "@/types/common.types";

export enum ExpenseStatusEnum {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum ExpensePriorityEnum {
  ROUTINE = "ROUTINE",
  STANDARD = "STANDARD",
  URGENT = "URGENT",
  EMERGENCY = "EMERGENCY",
}

export enum BudgetExceptionTypeEnum {
  NONE = "NONE",
  EMERGENCY = "EMERGENCY",
  ANNUAL = "ANNUAL",
  RECURRING = "RECURRING",
}

export interface ExpenseAmount {
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface Expense {
  expenseId: string;
  userId: string;
  vendorId: string;
  categoryId: string;
  departmentId?: string | null;
  description: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: ExpenseStatusEnum;
  priority: ExpensePriorityEnum;
  budgetOverride: BudgetExceptionTypeEnum;
  justification?: string | null;
  approvalDeadline?: string | null;
  receiptUrl?: string | null;
  dateOfExpense: string;
  linkedPOId?: string | null;
  inventoryDropId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  vendor?: Vendor;
  category?: Category;
  department?: Department;
  tagIds?: string[];
}

export interface CreateExpenseRequest {
  vendorId: string;
  categoryId: string;
  departmentId?: string | null;
  description: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  expenseDate: string;
  receiptUrl?: string | null;
  priority?: ExpensePriorityEnum;
  budgetOverride?: BudgetExceptionTypeEnum;
  justification?: string | null;
  tagIds?: string[];
}

export interface UpdateExpenseRequest {
  vendorId?: string;
  categoryId?: string;
  departmentId?: string | null;
  description?: string;
  netAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  expenseDate?: string;
  receiptUrl?: string | null;
  tagIds?: string[];
}

export interface SubmitExpenseRequest {
  budgetOverride?: BudgetExceptionTypeEnum;
  justification?: string | null;
}

export interface GetAllExpensesParams {
  userId?: string;
  vendorId?: string;
  categoryId?: string;
  departmentId?: string;
  status?: ExpenseStatusEnum;
  priority?: ExpensePriorityEnum;
  page?: number;
  limit?: number;
}

export interface PaginatedExpensesResponse {
  data: Expense[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExpenseFilters {
  status?: ExpenseStatusEnum;
  priority?: ExpensePriorityEnum;
  departmentId?: string;
  categoryId?: string;
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface ExpenseAggregation {
  groupBy: string;
  groupId: string;
  groupName?: string;
  totalAmount: number;
  count: number;
}

export interface ExpenseAggregationParams {
  status?: ExpenseStatusEnum;
  userId?: string;
  vendorId?: string;
  categoryId?: string;
  departmentId?: string;
  dateFrom?: string;
  dateTo?: string;
  groupBy?: string[];
}
