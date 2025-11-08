import type { PrismaClient } from "@prisma/client";
import type { IBudgetCommandRepository } from "../../domain/repositories/IBudgetCommandRepository.js";
import type { Budget } from "../../domain/entities/Budget.js";
import type { BudgetId } from "../../domain/value-objects/index.js";

export class PrismaBudgetCommandRepository implements IBudgetCommandRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(budget: Budget): Promise<Budget> {
    const plainObject = budget.toPlainObject();

    await this.prisma.budget.upsert({
      where: { budgetId: plainObject.id },
      create: {
        budgetId: plainObject.id,
        departmentId: plainObject.departmentId,
        categoryId: plainObject.categoryId,
        budgetAmount: plainObject.budgetAmount,
        spentAmount: plainObject.spentAmount,
        fiscalPeriod: plainObject.fiscalPeriod,
        startDate: plainObject.startDate,
        endDate: plainObject.endDate,
        isActive: plainObject.isActive,
        createdAt: plainObject.createdAt,
        updatedAt: plainObject.updatedAt,
      },
      update: {
        budgetAmount: plainObject.budgetAmount,
        spentAmount: plainObject.spentAmount,
        isActive: plainObject.isActive,
        updatedAt: plainObject.updatedAt,
      },
    });

    return budget;
  }

  async saveMany(budgets: Budget[]): Promise<Budget[]> {
    await this.prisma.$transaction(
      budgets.map((budget) => {
        const plainObject = budget.toPlainObject();

        return this.prisma.budget.upsert({
          where: { budgetId: plainObject.id },
          create: {
            budgetId: plainObject.id,
            departmentId: plainObject.departmentId,
            categoryId: plainObject.categoryId,
            budgetAmount: plainObject.budgetAmount,
            spentAmount: plainObject.spentAmount,
            fiscalPeriod: plainObject.fiscalPeriod,
            startDate: plainObject.startDate,
            endDate: plainObject.endDate,
            isActive: plainObject.isActive,
            createdAt: plainObject.createdAt,
            updatedAt: plainObject.updatedAt,
          },
          update: {
            budgetAmount: plainObject.budgetAmount,
            spentAmount: plainObject.spentAmount,
            isActive: plainObject.isActive,
            updatedAt: plainObject.updatedAt,
          },
        });
      })
    );

    return budgets;
  }

  async delete(budgetId: BudgetId): Promise<void> {
    await this.prisma.budget.delete({
      where: { budgetId: budgetId.getValue() },
    });
  }

  async exists(budgetId: BudgetId): Promise<boolean> {
    const count = await this.prisma.budget.count({
      where: { budgetId: budgetId.getValue() },
    });

    return count > 0;
  }
}
