import { Budget } from "../entities/Budget.js";
import {
  BudgetId,
  DepartmentId,
  CategoryId,
  FiscalPeriod,
} from "../value-objects/index.js";

export interface BudgetFilters {
  departmentId?: DepartmentId;
  categoryId?: CategoryId;
  fiscalPeriod?: FiscalPeriod;
  isActive?: boolean;
  isOverBudget?: boolean;
  isNearLimit?: boolean;
}

export interface IBudgetQueryRepository {
  findById(budgetId: BudgetId): Promise<Budget | null>;
  findByDepartmentId(departmentId: DepartmentId): Promise<Budget[]>;
  findByCategoryId(categoryId: CategoryId): Promise<Budget[]>;
  findByDepartmentAndCategory(
    departmentId: DepartmentId,
    categoryId: CategoryId
  ): Promise<Budget[]>;
  findByDepartmentAndCategoryAndPeriod(
    departmentId: DepartmentId,
    categoryId: CategoryId,
    fiscalPeriod: FiscalPeriod
  ): Promise<Budget | null>;
  // Find active department budget for a fiscal period (for department-based budgets)
  findActiveDepartmentBudget(
    departmentId: DepartmentId,
    fiscalPeriod: FiscalPeriod
  ): Promise<Budget | null>;
  findByFiscalPeriod(fiscalPeriod: FiscalPeriod): Promise<Budget[]>;
  findActive(): Promise<Budget[]>;
  findOverBudget(): Promise<Budget[]>;
  findAll(filters?: BudgetFilters): Promise<Budget[]>;
  count(filters?: BudgetFilters): Promise<number>;
}
