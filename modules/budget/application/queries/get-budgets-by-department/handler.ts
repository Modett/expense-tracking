import type { IBudgetQueryRepository } from "../../../domain/repositories/IBudgetQueryRepository.js";
import { DepartmentId } from "../../../domain/index.js";
import type { GetBudgetsByDepartmentQuery } from "./query.js";

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

export class GetBudgetsByDepartmentQueryHandler {
  constructor(private readonly budgetQueryRepo: IBudgetQueryRepository) {}

  async handle(query: GetBudgetsByDepartmentQuery): Promise<BudgetDTO[]> {
    const departmentId = DepartmentId.fromString(query.departmentId);

    const budgets = await this.budgetQueryRepo.findByDepartmentId(departmentId);

    return budgets.map((budget) => budget.toPlainObject());
  }
}
