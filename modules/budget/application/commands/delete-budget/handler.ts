import type { IBudgetCommandRepository } from "../../../domain/repositories/IBudgetCommandRepository.js";
import type { IBudgetQueryRepository } from "../../../domain/repositories/IBudgetQueryRepository.js";
import { BudgetId } from "../../../domain/index.js";
import type { DeleteBudgetCommand } from "./command.js";

export interface DeleteBudgetResponse {
  success: boolean;
}

export class DeleteBudgetCommandHandler {
  constructor(
    private readonly budgetQueryRepo: IBudgetQueryRepository,
    private readonly budgetCommandRepo: IBudgetCommandRepository
  ) {}

  async handle(command: DeleteBudgetCommand): Promise<DeleteBudgetResponse> {
    const budgetId = BudgetId.fromString(command.budgetId);

    const budget = await this.budgetQueryRepo.findById(budgetId);
    if (!budget) {
      throw new Error(`Budget with ID ${command.budgetId} not found`);
    }

    await this.budgetCommandRepo.delete(budgetId);

    return {
      success: true,
    };
  }
}
