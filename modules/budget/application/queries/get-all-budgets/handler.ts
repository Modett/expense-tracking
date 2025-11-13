import type {
  IBudgetQueryRepository,
  BudgetFilters,
} from "../../../domain/repositories/IBudgetQueryRepository.js";
import { DepartmentId, CategoryId, FiscalPeriod } from "../../../domain/index.js";
import type { GetAllBudgetsQuery } from "./query.js";

export interface BudgetDTO {
  id: string;
  departmentId: string;
  categoryId: string | null;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  fiscalPeriod: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  enforcementType: string;
  overrideAllowed: boolean;
  thresholds: {
    warning1: number;
    warning2: number;
    critical: number;
  };
  exceededThreshold: { level: string; threshold: number } | null;
  isOverBudget: boolean;
  isNearLimit: boolean;
  isExhausted: boolean;
  isPeriodActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class GetAllBudgetsQueryHandler {
  constructor(private readonly budgetQueryRepo: IBudgetQueryRepository) {}

  async handle(query: GetAllBudgetsQuery): Promise<BudgetDTO[]> {
    const filters: BudgetFilters = {};

    if (query.departmentId) {
      filters.departmentId = DepartmentId.fromString(query.departmentId);
    }

    if (query.categoryId) {
      filters.categoryId = CategoryId.fromString(query.categoryId);
    }

    if (query.fiscalPeriod) {
      filters.fiscalPeriod = FiscalPeriod.fromString(query.fiscalPeriod);
    }

    if (query.isActive !== undefined) {
      filters.isActive = query.isActive;
    }

    if (query.isOverBudget !== undefined) {
      filters.isOverBudget = query.isOverBudget;
    }

    if (query.isNearLimit !== undefined) {
      filters.isNearLimit = query.isNearLimit;
    }

    const budgets = await this.budgetQueryRepo.findAll(filters);

    return budgets.map((budget) => budget.toPlainObject());
  }
}
