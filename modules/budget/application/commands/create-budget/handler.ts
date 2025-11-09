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
  categoryId: string;
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
    const categoryId = CategoryId.fromString(command.categoryId);
    const fiscalPeriod = FiscalPeriod.fromString(command.fiscalPeriod);

    // Check if budget already exists for this combination
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

    const budget = Budget.create({
      departmentId,
      categoryId,
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
      categoryId: command.categoryId,
      budgetAmount: command.budgetAmount,
      fiscalPeriod: command.fiscalPeriod,
      startDate: command.startDate.toISOString(),
      endDate: command.endDate.toISOString(),
    };
  }
}
