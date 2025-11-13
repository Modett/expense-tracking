import type { PrismaClient, Budget as PrismaBudget } from "@prisma/client";
import type {
  IBudgetQueryRepository,
  BudgetFilters,
} from "../../domain/repositories/IBudgetQueryRepository.js";
import { Budget } from "../../domain/entities/Budget.js";
import {
  BudgetId,
  BudgetAmount,
  FiscalPeriod,
  BudgetPeriod,
  DepartmentId,
  CategoryId,
  BudgetEnforcementType,
  BudgetThresholds,
} from "../../domain/value-objects/index.js";

export class PrismaBudgetQueryRepository implements IBudgetQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(prismaBudget: any): Budget {
    return Budget.reconstitute({
      id: BudgetId.fromString(prismaBudget.budgetId),
      departmentId: DepartmentId.fromString(prismaBudget.departmentId),
      categoryId: prismaBudget.categoryId
        ? CategoryId.fromString(prismaBudget.categoryId)
        : null,
      amount: BudgetAmount.create(
        Number(prismaBudget.budgetAmount),
        Number(prismaBudget.spentAmount)
      ),
      fiscalPeriod: FiscalPeriod.fromString(prismaBudget.fiscalPeriod),
      period: BudgetPeriod.create(prismaBudget.startDate, prismaBudget.endDate),
      isActive: prismaBudget.isActive,
      enforcementType: prismaBudget.enforcementType
        ? BudgetEnforcementType.fromString(prismaBudget.enforcementType)
        : BudgetEnforcementType.soft(),
      overrideAllowed: prismaBudget.overrideAllowed ?? true,
      thresholds: BudgetThresholds.create(
        prismaBudget.warningThreshold1 ?? 80,
        prismaBudget.warningThreshold2 ?? 90,
        prismaBudget.criticalThreshold ?? 100
      ),
      createdAt: prismaBudget.createdAt,
      updatedAt: prismaBudget.updatedAt,
    });
  }

  async findById(budgetId: BudgetId): Promise<Budget | null> {
    const budget = await this.prisma.budget.findUnique({
      where: { budgetId: budgetId.getValue() },
    });

    if (!budget) {
      return null;
    }

    return this.toDomain(budget);
  }

  async findByDepartmentId(departmentId: DepartmentId): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { departmentId: departmentId.getValue() },
      orderBy: { createdAt: "desc" },
    });

    return budgets.map((budget) => this.toDomain(budget));
  }

  async findByCategoryId(categoryId: CategoryId): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { categoryId: categoryId.getValue() },
      orderBy: { createdAt: "desc" },
    });

    return budgets.map((budget) => this.toDomain(budget));
  }

  async findByDepartmentAndCategory(
    departmentId: DepartmentId,
    categoryId: CategoryId
  ): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({
      where: {
        departmentId: departmentId.getValue(),
        categoryId: categoryId.getValue(),
      },
      orderBy: { createdAt: "desc" },
    });

    return budgets.map((budget) => this.toDomain(budget));
  }

  async findByDepartmentAndCategoryAndPeriod(
    departmentId: DepartmentId,
    categoryId: CategoryId,
    fiscalPeriod: FiscalPeriod
  ): Promise<Budget | null> {
    const budget = await this.prisma.budget.findFirst({
      where: {
        departmentId: departmentId.getValue(),
        categoryId: categoryId.getValue(),
        fiscalPeriod: fiscalPeriod.getValue(),
      },
    });

    if (!budget) {
      return null;
    }

    return this.toDomain(budget);
  }

  async findActiveDepartmentBudget(
    departmentId: DepartmentId,
    fiscalPeriod: FiscalPeriod
  ): Promise<Budget | null> {
    const budgets = await this.prisma.budget.findMany({
      where: {
        departmentId: departmentId.getValue(),
        fiscalPeriod: fiscalPeriod.getValue(),
        isActive: true,
      },
    });

    // Filter for department-only budgets (categoryId is null)
    const departmentBudget = budgets.find((b) => b.categoryId === null);

    if (!departmentBudget) {
      return null;
    }

    return this.toDomain(departmentBudget);
  }

  async findByFiscalPeriod(fiscalPeriod: FiscalPeriod): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { fiscalPeriod: fiscalPeriod.getValue() },
      orderBy: { createdAt: "desc" },
    });

    return budgets.map((budget) => this.toDomain(budget));
  }

  async findActive(): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return budgets.map((budget) => this.toDomain(budget));
  }

  async findOverBudget(): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({
      where: {
        spentAmount: {
          gt: this.prisma.budget.fields.budgetAmount,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return budgets.map((budget) => this.toDomain(budget));
  }

  async findAll(filters?: BudgetFilters): Promise<Budget[]> {
    const where: any = {};

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId.getValue();
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId.getValue();
    }

    if (filters?.fiscalPeriod) {
      where.fiscalPeriod = filters.fiscalPeriod.getValue();
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const budgets = await this.prisma.budget.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    let result = budgets.map((budget) => this.toDomain(budget));

    // Apply client-side filters for complex conditions
    if (filters?.isOverBudget !== undefined) {
      result = result.filter((b) => b.isOverBudget() === filters.isOverBudget);
    }

    if (filters?.isNearLimit !== undefined) {
      result = result.filter((b) => b.isNearLimit() === filters.isNearLimit);
    }

    return result;
  }

  async count(filters?: BudgetFilters): Promise<number> {
    const where: any = {};

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId.getValue();
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId.getValue();
    }

    if (filters?.fiscalPeriod) {
      where.fiscalPeriod = filters.fiscalPeriod.getValue();
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return await this.prisma.budget.count({ where });
  }
}
