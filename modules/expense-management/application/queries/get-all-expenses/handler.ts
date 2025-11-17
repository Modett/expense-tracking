import type {
  IExpenseQueryRepository,
  ExpenseFilters,
} from "../../../domain/repositories/IExpenseQueryRepository.js";
import {
  UserId,
  ExpenseStatus,
  ExpensePriority,
  CategoryId,
  DepartmentId,
  VendorId,
} from "../../../domain/value-objects/index.js";
import type { Expense } from "../../../domain/entities/Expense.js";
import type { GetAllExpensesQuery } from "./query.js";

export interface ExpenseListItem {
  id: string;
  userId: string;
  vendorId: string;
  categoryId: string;
  departmentId: string | null;
  description: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  priority: string;
  budgetOverride: string;
  receiptUrl?: string;
  dateOfExpense: Date;
  linkedPOId?: string;
  inventoryDropId?: string;
  tagIds: string[];
  createdAt: Date;
  updatedAt: Date;
  // Nested relations for frontend display
  vendor?: {
    vendorId: string;
    name: string;
  } | null;
  category?: {
    categoryId: string;
    name: string;
  } | null;
  department?: {
    departmentId: string;
    name: string;
  } | null;
  user?: {
    userId: string;
    name: string;
    email: string;
  } | null;
}

export interface GetAllExpensesResponse {
  expenses: ExpenseListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    userId?: string;
    status?: string;
    categoryId?: string;
    departmentId?: string;
    vendorId?: string;
    fromDate?: Date;
    toDate?: Date;
  };
}

export class GetAllExpensesQueryHandler {
  constructor(private readonly expenseQueryRepo: IExpenseQueryRepository) {}

  async handle(query: GetAllExpensesQuery): Promise<GetAllExpensesResponse> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const filters: ExpenseFilters = {};

    if (query.userId) {
      filters.userId = UserId.fromString(query.userId);
    }
    if (query.status) {
      filters.status = ExpenseStatus.fromString(query.status);
    }
    if (query.categoryId) {
      filters.categoryId = CategoryId.fromString(query.categoryId);
    }
    if (query.priority) {
      filters.priority = ExpensePriority.fromString(query.priority);
    }
    if (query.departmentId) {
      filters.departmentId = DepartmentId.fromString(query.departmentId);
    }
    if (query.vendorId) {
      filters.vendorId = VendorId.fromString(query.vendorId);
    }
    if (query.fromDate) {
      filters.dateFrom = query.fromDate;
    }
    if (query.toDate) {
      filters.dateTo = query.toDate;
    }

    const total = await this.expenseQueryRepo.count(filters);

    const allExpenses = await this.expenseQueryRepo.findAll(filters);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const expenses = allExpenses.slice(startIndex, endIndex);

    const expenseItems: ExpenseListItem[] = expenses.map((expense: Expense) => {
      const plainObject = expense.toPlainObject();

      const item: ExpenseListItem = {
        id: plainObject.id,
        userId: plainObject.userId,
        vendorId: plainObject.vendorId,
        categoryId: plainObject.categoryId,
        departmentId: plainObject.departmentId,
        description: plainObject.description,
        netAmount: plainObject.amountNet,
        taxAmount: plainObject.taxAmount,
        totalAmount: plainObject.totalAmount,
        status: plainObject.status,
        priority: plainObject.priority,
        budgetOverride: plainObject.budgetOverride,
        dateOfExpense: plainObject.dateOfExpense,
        tagIds: plainObject.tagIds,
        createdAt: plainObject.createdAt,
        updatedAt: plainObject.updatedAt,
      };

      if (plainObject.receiptUrl) {
        item.receiptUrl = plainObject.receiptUrl;
      }
      if (plainObject.linkedPOId) {
        item.linkedPOId = plainObject.linkedPOId;
      }
      if (plainObject.inventoryDropId) {
        item.inventoryDropId = plainObject.inventoryDropId;
      }

      // Add nested relations if available (populated by query repository)
      if (plainObject.vendor) {
        item.vendor = {
          vendorId: plainObject.vendor.vendorId,
          name: plainObject.vendor.name,
        };
      }
      if (plainObject.category) {
        item.category = {
          categoryId: plainObject.category.categoryId,
          name: plainObject.category.name,
        };
      }
      if (plainObject.department) {
        item.department = {
          departmentId: plainObject.department.departmentId,
          name: plainObject.department.name,
        };
      }
      if (plainObject.user) {
        item.user = {
          userId: plainObject.user.userId,
          name: plainObject.user.name,
          email: plainObject.user.email,
        };
      }

      return item;
    });

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const responseFilters: {
      userId?: string;
      status?: string;
      categoryId?: string;
      departmentId?: string;
      vendorId?: string;
      fromDate?: Date;
      toDate?: Date;
    } = {};

    if (query.userId) responseFilters.userId = query.userId;
    if (query.status) responseFilters.status = query.status;
    if (query.categoryId) responseFilters.categoryId = query.categoryId;
    if (query.departmentId) responseFilters.departmentId = query.departmentId;
    if (query.vendorId) responseFilters.vendorId = query.vendorId;
    if (query.fromDate) responseFilters.fromDate = query.fromDate;
    if (query.toDate) responseFilters.toDate = query.toDate;

    return {
      expenses: expenseItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
      filters: responseFilters,
    };
  }
}
