import type { IBudgetQueryRepository } from "../../../domain/repositories/IBudgetQueryRepository.js";
import { DepartmentId, CategoryId, FiscalPeriod } from "../../../domain/index.js";
import type { GetBudgetStatusQuery } from "./query.js";

export interface BudgetStatusDTO {
  exists: boolean;
  budgetId?: string;
  budgetAmount?: number;
  spentAmount?: number;
  remainingAmount?: number;
  utilizationPercentage?: number;
  isOverBudget?: boolean;
  isNearLimit?: boolean;
  isExhausted?: boolean;
  canAccommodate?: (amount: number) => boolean;
}

export class GetBudgetStatusQueryHandler {
  constructor(private readonly budgetQueryRepo: IBudgetQueryRepository) {}

  async handle(query: GetBudgetStatusQuery): Promise<BudgetStatusDTO> {
    const departmentId = DepartmentId.fromString(query.departmentId);
    const categoryId = CategoryId.fromString(query.categoryId);
    const fiscalPeriod = FiscalPeriod.fromString(query.fiscalPeriod);

    const budget =
      await this.budgetQueryRepo.findByDepartmentAndCategoryAndPeriod(
        departmentId,
        categoryId,
        fiscalPeriod
      );

    if (!budget) {
      return { exists: false };
    }

    return {
      exists: true,
      budgetId: budget.id.getValue(),
      budgetAmount: budget.amount.getBudgetAmount(),
      spentAmount: budget.amount.getSpentAmount(),
      remainingAmount: budget.getRemainingAmount(),
      utilizationPercentage: budget.getUtilizationPercentage(),
      isOverBudget: budget.isOverBudget(),
      isNearLimit: budget.isNearLimit(),
      isExhausted: budget.isExhausted(),
      canAccommodate: (amount: number) => budget.canAccommodateExpense(amount),
    };
  }
}
