import type { IBudgetCommandRepository } from "../../../domain/repositories/IBudgetCommandRepository.js";
import type { IBudgetQueryRepository } from "../../../domain/repositories/IBudgetQueryRepository.js";
import { BudgetId } from "../../../domain/index.js";
import type { AdjustBudgetSpentCommand } from "./command.js";

export interface AdjustBudgetSpentResponse {
  success: boolean;
  budgetId: string;
  newSpentAmount: number;
}

export class AdjustBudgetSpentCommandHandler {
  constructor(
    private readonly budgetQueryRepo: IBudgetQueryRepository,
    private readonly budgetCommandRepo: IBudgetCommandRepository
  ) {}

  async handle(
    command: AdjustBudgetSpentCommand
  ): Promise<AdjustBudgetSpentResponse> {
    const budgetId = BudgetId.fromString(command.budgetId);

    const budget = await this.budgetQueryRepo.findById(budgetId);
    if (!budget) {
      throw new Error(`Budget with ID ${command.budgetId} not found`);
    }

    if (command.operation === "add") {
      budget.addSpent(command.amount);
    } else {
      budget.subtractSpent(command.amount);
    }

    await this.budgetCommandRepo.save(budget);

    return {
      success: true,
      budgetId: budget.id.getValue(),
      newSpentAmount: budget.amount.getSpentAmount(),
    };
  }
}
