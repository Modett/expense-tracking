import type { IBudgetCommandRepository } from "../../../domain/repositories/IBudgetCommandRepository.js";
import type { IBudgetQueryRepository } from "../../../domain/repositories/IBudgetQueryRepository.js";
import { BudgetId } from "../../../domain/index.js";
import type { UpdateBudgetCommand } from "./command.js";

export interface UpdateBudgetResponse {
  success: boolean;
  budgetId: string;
}

export class UpdateBudgetCommandHandler {
  constructor(
    private readonly budgetQueryRepo: IBudgetQueryRepository,
    private readonly budgetCommandRepo: IBudgetCommandRepository
  ) {}

  async handle(command: UpdateBudgetCommand): Promise<UpdateBudgetResponse> {
    const budgetId = BudgetId.fromString(command.budgetId);

    const budget = await this.budgetQueryRepo.findById(budgetId);
    if (!budget) {
      throw new Error(`Budget with ID ${command.budgetId} not found`);
    }

    budget.updateBudgetAmount(command.budgetAmount);

    await this.budgetCommandRepo.save(budget);

    return {
      success: true,
      budgetId: budget.id.getValue(),
    };
  }
}
