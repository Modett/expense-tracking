import type { IBudgetCommandRepository } from "../../../domain/repositories/IBudgetCommandRepository.js";
import type { IBudgetQueryRepository } from "../../../domain/repositories/IBudgetQueryRepository.js";
import { BudgetId } from "../../../domain/index.js";
import type { ActivateBudgetCommand } from "./command.js";

export interface ActivateBudgetResponse {
  success: boolean;
  budgetId: string;
}

export class ActivateBudgetCommandHandler {
  constructor(
    private readonly budgetQueryRepo: IBudgetQueryRepository,
    private readonly budgetCommandRepo: IBudgetCommandRepository
  ) {}

  async handle(command: ActivateBudgetCommand): Promise<ActivateBudgetResponse> {
    const budgetId = BudgetId.fromString(command.budgetId);

    const budget = await this.budgetQueryRepo.findById(budgetId);
    if (!budget) {
      throw new Error(`Budget with ID ${command.budgetId} not found`);
    }

    budget.activate();

    await this.budgetCommandRepo.save(budget);

    return {
      success: true,
      budgetId: budget.id.getValue(),
    };
  }
}
