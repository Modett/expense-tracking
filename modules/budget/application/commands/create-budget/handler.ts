import type { IBudgetCommandRepository } from "../../../domain/repositories/IBudgetCommandRepository.js";
import type { IBudgetQueryRepository } from "../../../domain/repositories/IBudgetQueryRepository.js";
import {
  Budget,
  DepartmentId,
  CategoryId,
  FiscalPeriod,
} from "../../../domain/index.js";
import type { CreateBudgetCommand } from "./command.js";

export interface CreateBudgetResponse {
  success: boolean;
  budgetId: string;
  departmentId: string;
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
    const departmentId = DepartmentId.fromString(command.departmentId);
    const categoryId = command.categoryId
      ? CategoryId.fromString(command.categoryId)
      : null;
    const fiscalPeriod = FiscalPeriod.fromString(command.fiscalPeriod);

    // Check if budget already exists for this combination
    if (categoryId) {
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
    } else {
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

    const budget = Budget.create({
      departmentId,
      categoryId: categoryId ?? null,
      budgetAmount: command.budgetAmount,
      fiscalPeriod,
      startDate: command.startDate,
      endDate: command.endDate,
    });

    await this.budgetCommandRepo.save(budget);

    return {
      success: true,
      budgetId: budget.id.getValue(),
      departmentId: command.departmentId,
      categoryId: command.categoryId ?? null,
      budgetAmount: command.budgetAmount,
      fiscalPeriod: command.fiscalPeriod,
      startDate: command.startDate.toISOString(),
      endDate: command.endDate.toISOString(),
    };
  }
}
