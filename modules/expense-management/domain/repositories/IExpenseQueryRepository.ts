import { Expense } from "../entities/Expense.js";
import {
  ExpenseId,
  ExpenseStatus,
  ExpensePriority,
  UserId,
  VendorId,
  CategoryId,
  DepartmentId,
} from "../value-objects/index.js";

export interface ExpenseFilters {
  userId?: UserId;
  vendorId?: VendorId;
  categoryId?: CategoryId;
  departmentId?: DepartmentId;
  status?: ExpenseStatus;
  priority?: ExpensePriority;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExpenseAggregation {
  groupBy: string;
  groupId: string;
  groupName?: string;
  totalAmount: number;
  count: number;
}

export interface IExpenseQueryRepository {
  findById(expenseId: ExpenseId): Promise<Expense | null>;
  findByUserId(userId: UserId): Promise<Expense[]>;
  findByStatus(status: ExpenseStatus): Promise<Expense[]>;
  findByCategoryId(categoryId: CategoryId): Promise<Expense[]>;
  findByDepartmentId(departmentId: DepartmentId): Promise<Expense[]>;
  findByVendorId(vendorId: VendorId): Promise<Expense[]>;
  findAll(filters?: ExpenseFilters): Promise<Expense[]>;
  count(filters?: ExpenseFilters): Promise<number>;
  getAggregations(
    filters: ExpenseFilters,
    groupBy: string[]
  ): Promise<ExpenseAggregation[]>;
}
