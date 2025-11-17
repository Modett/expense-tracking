import type { IBudgetCommandRepository } from "../../../domain/repositories/IBudgetCommandRepository.js";
import type { IBudgetQueryRepository } from "../../../domain/repositories/IBudgetQueryRepository.js";
import {
  Budget,
  DepartmentId,
  CategoryId,
  FiscalPeriod,
  BudgetEnforcementType,
  BudgetThresholds,
} from "../../../domain/index.js";
import type { CreateBudgetCommand } from "./command.js";

export interface CreateBudgetResponse {
  success: boolean;
  budgetId: string;
  departmentId: string | null;
  categoryId: string | null;
  budgetAmount: number;
  fiscalPeriod: string;
  startDate: string;
  endDate: string;
}

export class CreateBudgetCommandHandler {
  constructor(
    private readonly budgetQueryRepo: IBudgetQueryRepository,
    private readonly budgetCommandRepo: IBudgetCommandRepository
  ) {}

  async handle(command: CreateBudgetCommand): Promise<CreateBudgetResponse> {
    const departmentId = command.departmentId
      ? DepartmentId.fromString(command.departmentId)
      : null;
    const categoryId = command.categoryId
      ? CategoryId.fromString(command.categoryId)
      : null;
    const fiscalPeriod = FiscalPeriod.fromString(command.fiscalPeriod);

    // Check if budget already exists for this combination
    if (departmentId && categoryId) {
      const existingBudget =
        await this.budgetQueryRepo.findByDepartmentAndCategoryAndPeriod(
          departmentId,
          categoryId,
          fiscalPeriod
        );

      if (existingBudget) {
        throw new Error(
          `Budget already exists for department ${command.departmentId}, category ${command.categoryId}, and fiscal period ${command.fiscalPeriod}`
        );
      }
    } else if (departmentId) {
      const existingBudget =
        await this.budgetQueryRepo.findActiveDepartmentBudget(
          departmentId,
          fiscalPeriod
        );

      if (existingBudget) {
        throw new Error(
          `Department budget already exists for department ${command.departmentId} and fiscal period ${command.fiscalPeriod}`
        );
      }
    }

    // Parse enforcement type if provided
    const enforcementType = command.enforcementType
      ? BudgetEnforcementType.fromString(command.enforcementType)
      : undefined;

    // Create thresholds if any threshold values are provided
    const thresholds =
      command.warningThreshold1 !== undefined ||
      command.warningThreshold2 !== undefined ||
      command.criticalThreshold !== undefined
        ? BudgetThresholds.create(
            command.warningThreshold1,
            command.warningThreshold2,
            command.criticalThreshold
          )
        : undefined;

    const budget = Budget.create({
      departmentId,
      categoryId: categoryId ?? null,
      budgetAmount: command.budgetAmount,
      fiscalPeriod,
      startDate: command.startDate,
      endDate: command.endDate,
      ...(enforcementType && { enforcementType }),
      ...(command.overrideAllowed !== undefined && { overrideAllowed: command.overrideAllowed }),
      ...(thresholds && { thresholds }),
    });

    await this.budgetCommandRepo.save(budget);

    return {
      success: true,
      budgetId: budget.id.getValue(),
      departmentId: command.departmentId ?? null,
      categoryId: command.categoryId ?? null,
      budgetAmount: command.budgetAmount,
      fiscalPeriod: command.fiscalPeriod,
      startDate: command.startDate.toISOString(),
      endDate: command.endDate.toISOString(),
    };
  }
}
