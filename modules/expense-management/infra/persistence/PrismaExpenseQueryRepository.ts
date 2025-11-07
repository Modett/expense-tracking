import type { PrismaClient } from "@prisma/client";
import type {
  IExpenseQueryRepository,
  ExpenseFilters,
} from "../../domain/repositories/IExpenseQueryRepository.js";
import { Expense } from "../../domain/entities/Expense.js";
import {
  ExpenseId,
  ExpenseDescription,
  ExpenseStatus,
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

export class PrismaExpenseQueryRepository implements IExpenseQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(prismaExpense: PrismaExpense & { expenseTags?: Array<{ tagId: string }> }): Expense {
    const tagIds = prismaExpense.expenseTags
      ? prismaExpense.expenseTags.map((et) => TagId.fromString(et.tagId))
      : [];

    return Expense.reconstitute({
      id: ExpenseId.fromString(prismaExpense.expenseId),
      userId: UserId.fromString(prismaExpense.userId),
      vendorId: VendorId.fromString(prismaExpense.vendorId),
      categoryId: CategoryId.fromString(prismaExpense.categoryId),
      departmentId: DepartmentId.fromString(prismaExpense.departmentId),
      description: ExpenseDescription.fromString(prismaExpense.description),
      amount: ExpenseAmount.create(
        Number(prismaExpense.amountNet),
        Number(prismaExpense.taxAmount),
        Number(prismaExpense.totalAmount)
      ),
      status: ExpenseStatus.fromString(prismaExpense.status),
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
  }

  async findById(expenseId: ExpenseId): Promise<Expense | null> {
    const expense = await this.prisma.expense.findUnique({
      where: { expenseId: expenseId.getValue() },
      include: {
        expenseTags: {
          select: { tagId: true },
        },
      },
    });

    if (!expense) {
      return null;
    }

    return this.toDomain(expense);
  }

  async findByUserId(userId: UserId): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { userId: userId.getValue() },
      include: {
        expenseTags: {
          select: { tagId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return expenses.map((expense) => this.toDomain(expense));
  }

  async findByStatus(status: ExpenseStatus): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { status: status.getValue() },
      include: {
        expenseTags: {
          select: { tagId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return expenses.map((expense) => this.toDomain(expense));
  }

  async findByCategoryId(categoryId: CategoryId): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { categoryId: categoryId.getValue() },
      include: {
        expenseTags: {
          select: { tagId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return expenses.map((expense) => this.toDomain(expense));
  }

  async findByDepartmentId(departmentId: DepartmentId): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { departmentId: departmentId.getValue() },
      include: {
        expenseTags: {
          select: { tagId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return expenses.map((expense) => this.toDomain(expense));
  }

  async findByVendorId(vendorId: VendorId): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { vendorId: vendorId.getValue() },
      include: {
        expenseTags: {
          select: { tagId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return expenses.map((expense) => this.toDomain(expense));
  }

  async findAll(filters?: ExpenseFilters): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId.getValue() }),
        ...(filters?.vendorId && { vendorId: filters.vendorId.getValue() }),
        ...(filters?.categoryId && { categoryId: filters.categoryId.getValue() }),
        ...(filters?.departmentId && {
          departmentId: filters.departmentId.getValue(),
        }),
        ...(filters?.status && { status: filters.status.getValue() }),
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
                ...(filters.minAmount !== undefined && { gte: filters.minAmount }),
                ...(filters.maxAmount !== undefined && { lte: filters.maxAmount }),
              },
            }
          : {}),
      },
      include: {
        expenseTags: {
          select: { tagId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return expenses.map((expense) => this.toDomain(expense));
  }

  async count(filters?: ExpenseFilters): Promise<number> {
    return this.prisma.expense.count({
      where: {
        ...(filters?.userId && { userId: filters.userId.getValue() }),
        ...(filters?.vendorId && { vendorId: filters.vendorId.getValue() }),
        ...(filters?.categoryId && { categoryId: filters.categoryId.getValue() }),
        ...(filters?.departmentId && {
          departmentId: filters.departmentId.getValue(),
        }),
        ...(filters?.status && { status: filters.status.getValue() }),
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
                ...(filters.minAmount !== undefined && { gte: filters.minAmount }),
                ...(filters.maxAmount !== undefined && { lte: filters.maxAmount }),
              },
            }
          : {}),
      },
    });
  }
}
