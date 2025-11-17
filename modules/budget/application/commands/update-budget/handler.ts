import type { IBudgetCommandRepository } from "../../../domain/repositories/IBudgetCommandRepository.js";
import type { IBudgetQueryRepository } from "../../../domain/repositories/IBudgetQueryRepository.js";
import {
  BudgetId,
  BudgetEnforcementType,
  BudgetThresholds,
} from "../../../domain/index.js";
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

    if (command.budgetAmount !== undefined) {
      budget.updateBudgetAmount(command.budgetAmount);
    }

    if (
      command.enforcementType !== undefined ||
      command.overrideAllowed !== undefined
    ) {
      const enforcementType = command.enforcementType
        ? BudgetEnforcementType.fromString(command.enforcementType)
        : budget.enforcementType;
      const overrideAllowed = command.overrideAllowed ?? budget.overrideAllowed;
      budget.updateEnforcement(enforcementType, overrideAllowed);
    }

    if (
      command.warningThreshold1 !== undefined ||
      command.warningThreshold2 !== undefined ||
      command.criticalThreshold !== undefined
    ) {
      const currentThresholds = budget.thresholds;
      const updatedThresholds = BudgetThresholds.create(
        command.warningThreshold1 ?? currentThresholds.getWarning1(),
        command.warningThreshold2 ?? currentThresholds.getWarning2(),
        command.criticalThreshold ?? currentThresholds.getCritical()
      );
      budget.updateThresholds(updatedThresholds);
    }

    await this.budgetCommandRepo.save(budget);

    return {
      success: true,
      budgetId: budget.id.getValue(),
    };
  }
}
