import type { PrismaClient } from "@prisma/client";
import type {
  IExpenseQueryRepository,
  ExpenseFilters,
  ExpenseAggregation,
} from "../../domain/repositories/IExpenseQueryRepository.js";
import { Expense } from "../../domain/entities/Expense.js";
import {
  ExpenseId,
  ExpenseDescription,
  ExpenseStatus,
  ExpensePriority,
  BudgetExceptionType,
  DateOfExpense,
  ExpenseAmount,
  Receipt,
  PurchaseOrderId,
  InventoryDropId,
  UserId,
  VendorId,
  CategoryId,
  DepartmentId,
  TagId,
} from "../../domain/value-objects/index.js";
import type { Expense as PrismaExpense } from "@prisma/client";

type PrismaExpenseWithTags = PrismaExpense & {
  expenseTags?: Array<{ tagId: string }>;
  budgetOverride: string;
  approvalDeadline: Date | null;
  linkedPoId: string | null;
  vendor?: { vendorId: string; name: string } | null;
  category?: { categoryId: string; name: string } | null;
  department?: { departmentId: string; name: string } | null;
  user?: { userId: string; name: string; email: string } | null;
};

export class PrismaExpenseQueryRepository implements IExpenseQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private get relationIncludes() {
    return {
      expenseTags: {
        select: { tagId: true },
      },
      vendor: {
        select: { vendorId: true, name: true },
      },
      category: {
        select: { categoryId: true, name: true },
      },
      department: {
        select: { departmentId: true, name: true },
      },
      user: {
        select: { userId: true, name: true, email: true },
      },
    };
  }

  private toDomain(prismaExpense: PrismaExpenseWithTags): Expense {
    const tagIds = prismaExpense.expenseTags
      ? prismaExpense.expenseTags.map((et: { tagId: string }) =>
          TagId.fromString(et.tagId)
        )
      : [];

    const expense = Expense.reconstitute({
      id: ExpenseId.fromString(prismaExpense.expenseId),
      userId: UserId.fromString(prismaExpense.userId),
      vendorId: prismaExpense.vendorId
        ? VendorId.fromString(prismaExpense.vendorId)
        : null,
      categoryId: CategoryId.fromString(prismaExpense.categoryId),
      departmentId: prismaExpense.departmentId
        ? DepartmentId.fromString(prismaExpense.departmentId)
        : null,
      description: ExpenseDescription.fromString(prismaExpense.description),
      amount: ExpenseAmount.create(
        Number(prismaExpense.amountNet),
        Number(prismaExpense.taxAmount),
        Number(prismaExpense.totalAmount)
      ),
      status: ExpenseStatus.fromString(prismaExpense.status),
      priority: ExpensePriority.fromString(
        prismaExpense.priority || "standard"
      ),
      budgetOverride: BudgetExceptionType.fromString(
        prismaExpense.budgetOverride || "none"
      ),
      justification: prismaExpense.justification || undefined,
      approvalDeadline: prismaExpense.approvalDeadline || undefined,
      receipt: prismaExpense.receiptUrl
        ? Receipt.fromString(prismaExpense.receiptUrl)
        : undefined,
      dateOfExpense: DateOfExpense.create(prismaExpense.dateOfExpense),
      linkedPOId: prismaExpense.linkedPoId
        ? PurchaseOrderId.fromString(prismaExpense.linkedPoId)
        : undefined,
      inventoryDropId: prismaExpense.inventoryDropId
        ? InventoryDropId.fromString(prismaExpense.inventoryDropId)
        : undefined,
      tagIds,
      createdAt: prismaExpense.createdAt,
      updatedAt: prismaExpense.updatedAt,
    });

    // Attach relations metadata for query use cases
    if (prismaExpense.vendor || prismaExpense.category || prismaExpense.department || prismaExpense.user) {
      (expense as any)._relations = {
        vendor: prismaExpense.vendor,
        category: prismaExpense.category,
        department: prismaExpense.department,
        user: prismaExpense.user,
      };
    }

    return expense;
  }

  async findById(expenseId: ExpenseId): Promise<Expense | null> {
    const expense = await this.prisma.expense.findUnique({
      where: { expenseId: expenseId.getValue() },
      include: this.relationIncludes,
    });

    if (!expense) {
      return null;
    }

    return this.toDomain(expense);
  }

  async findByUserId(userId: UserId): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { userId: userId.getValue() },
      include: this.relationIncludes,
      orderBy: { createdAt: "desc" },
    });

    return expenses.map(
      (expense: PrismaExpenseWithTags): Expense => this.toDomain(expense)
    );
  }

  async findByStatus(status: ExpenseStatus): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { status: status.getValue() },
      include: this.relationIncludes,
      orderBy: { createdAt: "desc" },
    });

    return expenses.map(
      (expense: PrismaExpenseWithTags): Expense => this.toDomain(expense)
    );
  }

  async findByCategoryId(categoryId: CategoryId): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { categoryId: categoryId.getValue() },
      include: this.relationIncludes,
      orderBy: { createdAt: "desc" },
    });

    return expenses.map(
      (expense: PrismaExpenseWithTags): Expense => this.toDomain(expense)
    );
  }

  async findByDepartmentId(departmentId: DepartmentId): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { departmentId: departmentId.getValue() },
      include: this.relationIncludes,
      orderBy: { createdAt: "desc" },
    });

    return expenses.map(
      (expense: PrismaExpenseWithTags): Expense => this.toDomain(expense)
    );
  }

  async findByVendorId(vendorId: VendorId): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { vendorId: vendorId.getValue() },
      include: this.relationIncludes,
      orderBy: { createdAt: "desc" },
    });

    return expenses.map(
      (expense: PrismaExpenseWithTags): Expense => this.toDomain(expense)
    );
  }

  async findAll(filters?: ExpenseFilters): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId.getValue() }),
        ...(filters?.vendorId && { vendorId: filters.vendorId.getValue() }),
        ...(filters?.categoryId && {
          categoryId: filters.categoryId.getValue(),
        }),
        ...(filters?.departmentId && {
          departmentId: filters.departmentId.getValue(),
        }),
        ...(filters?.status && { status: filters.status.getValue() }),
        ...(filters?.priority && { priority: filters.priority.getValue() }),
        ...(filters?.dateFrom || filters?.dateTo
          ? {
              dateOfExpense: {
                ...(filters.dateFrom && { gte: filters.dateFrom }),
                ...(filters.dateTo && { lte: filters.dateTo }),
              },
            }
          : {}),
        ...(filters?.minAmount || filters?.maxAmount
          ? {
              totalAmount: {
                ...(filters.minAmount !== undefined && {
                  gte: filters.minAmount,
                }),
                ...(filters.maxAmount !== undefined && {
                  lte: filters.maxAmount,
                }),
              },
            }
          : {}),
      },
      include: this.relationIncludes,
      orderBy: { createdAt: "desc" },
    });

    return expenses.map(
      (expense: PrismaExpenseWithTags): Expense => this.toDomain(expense)
    );
  }

  async count(filters?: ExpenseFilters): Promise<number> {
    return this.prisma.expense.count({
      where: {
        ...(filters?.userId && { userId: filters.userId.getValue() }),
        ...(filters?.vendorId && { vendorId: filters.vendorId.getValue() }),
        ...(filters?.categoryId && {
          categoryId: filters.categoryId.getValue(),
        }),
        ...(filters?.departmentId && {
          departmentId: filters.departmentId.getValue(),
        }),
        ...(filters?.status && { status: filters.status.getValue() }),
        ...(filters?.priority && { priority: filters.priority.getValue() }),
        ...(filters?.dateFrom || filters?.dateTo
          ? {
              dateOfExpense: {
                ...(filters.dateFrom && { gte: filters.dateFrom }),
                ...(filters.dateTo && { lte: filters.dateTo }),
              },
            }
          : {}),
        ...(filters?.minAmount || filters?.maxAmount
          ? {
              totalAmount: {
                ...(filters.minAmount !== undefined && {
                  gte: filters.minAmount,
                }),
                ...(filters.maxAmount !== undefined && {
                  lte: filters.maxAmount,
                }),
              },
            }
          : {}),
      },
    });
  }

  async getAggregations(
    filters: ExpenseFilters = {},
    groupBy: string[]
  ): Promise<ExpenseAggregation[]> {
    const expenses = await this.findAll(filters);

    const aggregations: ExpenseAggregation[] = [];

    for (const field of groupBy) {
      const grouped = this.groupExpensesBy(expenses, field);
      aggregations.push(...grouped);
    }

    return aggregations;
  }

  private groupExpensesBy(
    expenses: Expense[],
    field: string
  ): ExpenseAggregation[] {
    const groups = new Map<string, { total: number; count: number }>();

    for (const expense of expenses) {
      let groupId: string;

      switch (field) {
        case "department":
          groupId = expense.departmentId?.getValue() || "unassigned";
          break;
        case "vendor":
          groupId = expense.vendorId?.getValue() || "unassigned";
          break;
        case "category":
          groupId = expense.categoryId.getValue();
          break;
        case "user":
          groupId = expense.userId.getValue();
          break;
        case "tag":
          // Group by first tag if exists, otherwise "untagged"
          groupId = expense.tagIds[0]?.getValue() || "untagged";
          break;
        default:
          continue;
      }

      const existing = groups.get(groupId) || { total: 0, count: 0 };
      existing.total += expense.amount.getTotalValue();
      existing.count += 1;
      groups.set(groupId, existing);
    }

    return Array.from(groups.entries()).map(([groupId, data]) => ({
      groupBy: field,
      groupId,
      totalAmount: data.total,
      count: data.count,
    }));
  }
}
