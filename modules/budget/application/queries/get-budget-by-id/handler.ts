import type { IBudgetQueryRepository } from "../../../domain/repositories/IBudgetQueryRepository.js";
import { BudgetId } from "../../../domain/index.js";
import type { GetBudgetByIdQuery } from "./query.js";

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

export class GetBudgetByIdQueryHandler {
  constructor(private readonly budgetQueryRepo: IBudgetQueryRepository) {}

  async handle(query: GetBudgetByIdQuery): Promise<BudgetDTO | null> {
    const budgetId = BudgetId.fromString(query.budgetId);

    const budget = await this.budgetQueryRepo.findById(budgetId);

    if (!budget) {
      return null;
    }

    return budget.toPlainObject();
  }
}
