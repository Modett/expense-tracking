import type { PrismaClient } from "@prisma/client";
import type { IExpenseCommandRepository } from "../../domain/repositories/IExpenseCommandRepository.js";
import type { Expense } from "../../domain/entities/Expense.js";
import type { ExpenseId } from "../../domain/value-objects/index.js";

export class PrismaExpenseCommandRepository
  implements IExpenseCommandRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async save(expense: Expense): Promise<Expense> {
    const plainObject = expense.toPlainObject();

    await this.prisma.expense.upsert({
      where: { expenseId: plainObject.id },
      create: {
        expenseId: plainObject.id,
        userId: plainObject.userId,
        vendorId: plainObject.vendorId,
        categoryId: plainObject.categoryId,
        departmentId: plainObject.departmentId,
        description: plainObject.description,
        amountNet: plainObject.amountNet,
        taxAmount: plainObject.taxAmount,
        totalAmount: plainObject.totalAmount,
        status: plainObject.status,
        priority: plainObject.priority,
        budgetOverride: plainObject.budgetOverride,
        justification: plainObject.justification,
        approvalDeadline: plainObject.approvalDeadline,
        receiptUrl: plainObject.receiptUrl,
        dateOfExpense: plainObject.dateOfExpense,
        linkedPoId: plainObject.linkedPOId,
        inventoryDropId: plainObject.inventoryDropId,
        createdAt: plainObject.createdAt,
        updatedAt: plainObject.updatedAt,
      },
      update: {
        description: plainObject.description,
        vendorId: plainObject.vendorId,
        categoryId: plainObject.categoryId,
        departmentId: plainObject.departmentId,
        amountNet: plainObject.amountNet,
        taxAmount: plainObject.taxAmount,
        totalAmount: plainObject.totalAmount,
        status: plainObject.status,
        priority: plainObject.priority,
        budgetOverride: plainObject.budgetOverride,
        justification: plainObject.justification,
        approvalDeadline: plainObject.approvalDeadline,
        receiptUrl: plainObject.receiptUrl,
        dateOfExpense: plainObject.dateOfExpense,
        linkedPoId: plainObject.linkedPOId,
        inventoryDropId: plainObject.inventoryDropId,
        updatedAt: plainObject.updatedAt,
      },
    });

    return expense;
  }

  async saveMany(expenses: Expense[]): Promise<Expense[]> {
    await this.prisma.$transaction(
      expenses.map((expense) => {
        const plainObject = expense.toPlainObject();

        return this.prisma.expense.upsert({
          where: { expenseId: plainObject.id },
          create: {
            expenseId: plainObject.id,
            userId: plainObject.userId,
            vendorId: plainObject.vendorId,
            categoryId: plainObject.categoryId,
            departmentId: plainObject.departmentId,
            description: plainObject.description,
            amountNet: plainObject.amountNet,
            taxAmount: plainObject.taxAmount,
            totalAmount: plainObject.totalAmount,
            status: plainObject.status,
            priority: plainObject.priority,
            budgetOverride: plainObject.budgetOverride,
            justification: plainObject.justification,
            approvalDeadline: plainObject.approvalDeadline,
            receiptUrl: plainObject.receiptUrl,
            dateOfExpense: plainObject.dateOfExpense,
            linkedPoId: plainObject.linkedPOId,
            inventoryDropId: plainObject.inventoryDropId,
            createdAt: plainObject.createdAt,
            updatedAt: plainObject.updatedAt,
          },
          update: {
            description: plainObject.description,
            vendorId: plainObject.vendorId,
            categoryId: plainObject.categoryId,
            departmentId: plainObject.departmentId,
            amountNet: plainObject.amountNet,
            taxAmount: plainObject.taxAmount,
            totalAmount: plainObject.totalAmount,
            status: plainObject.status,
            priority: plainObject.priority,
            budgetOverride: plainObject.budgetOverride,
            justification: plainObject.justification,
            approvalDeadline: plainObject.approvalDeadline,
            receiptUrl: plainObject.receiptUrl,
            dateOfExpense: plainObject.dateOfExpense,
            linkedPoId: plainObject.linkedPOId,
            inventoryDropId: plainObject.inventoryDropId,
            updatedAt: plainObject.updatedAt,
          },
        });
      })
    );

    return expenses;
  }

  async delete(expenseId: ExpenseId): Promise<void> {
    await this.prisma.expense.delete({
      where: { expenseId: expenseId.getValue() },
    });
  }

  async exists(expenseId: ExpenseId): Promise<boolean> {
    const count = await this.prisma.expense.count({
      where: { expenseId: expenseId.getValue() },
    });

    return count > 0;
  }
}
