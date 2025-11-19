import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseTagCommandRepository } from "../../../domain/repositories/IExpenseTagCommandRepository.js";
import {
  Expense,
  UserId,
  VendorId,
  CategoryId,
  DepartmentId,
  ExpenseDescription,
  ExpenseAmount,
  ExpensePriority,
  BudgetExceptionType,
  DateOfExpense,
  Receipt,
  TagId,
} from "../../../domain/index.js";
import { ExpenseTag } from "../../../domain/entities/ExpenseTag.js";
import type { CreateExpenseCommand } from "./command.js";

export interface CreateExpenseResponse {
  success: boolean;
  data: Record<string, any>;
}

export class CreateExpenseCommandHandler {
  constructor(
    private readonly expenseCommandRepo: IExpenseCommandRepository,
    private readonly expenseTagCommandRepo: IExpenseTagCommandRepository
  ) {}

  async handle(command: CreateExpenseCommand): Promise<CreateExpenseResponse> {
    const userId = UserId.fromString(command.userId);
    const categoryId = CategoryId.fromString(command.categoryId);

    // Handle optional vendor
    const vendorId = command.vendorId
      ? VendorId.fromString(command.vendorId)
      : null;

    // Handle optional department - if null, will be assigned to "General" at persistence layer
    const departmentId = command.departmentId
      ? DepartmentId.fromString(command.departmentId)
      : null;

    const description = ExpenseDescription.create(command.description);
    const amount = ExpenseAmount.create(
      command.netAmount,
      command.taxAmount,
      command.totalAmount
    );
    const dateOfExpense = DateOfExpense.create(command.expenseDate);

    // Parse priority (default to standard if not provided)
    const priority = command.priority
      ? ExpensePriority.fromString(command.priority)
      : ExpensePriority.standard();

    // Parse budget override (default to none if not provided)
    const budgetOverride = command.budgetOverride
      ? BudgetExceptionType.fromString(command.budgetOverride)
      : BudgetExceptionType.none();

    const receipt = command.receiptUrl
      ? Receipt.create(command.receiptUrl)
      : undefined;
    const tagIds = (command.tagIds ?? []).map((tagId) =>
      TagId.fromString(tagId)
    );

    const expenseProps: any = {
      userId,
      vendorId,
      categoryId,
      departmentId,
      description,
      amount,
      dateOfExpense,
      priority,
      budgetOverride,
      justification: command.justification,
      tagIds,
    };

    if (receipt) {
      expenseProps.receipt = receipt;
    }

    const expense = Expense.create(expenseProps);

    await this.expenseCommandRepo.save(expense);
    if (tagIds.length > 0) {
      const expenseTags = tagIds.map((tagId) =>
        ExpenseTag.create({ expenseId: expense.id, tagId })
      );
      await this.expenseTagCommandRepo.addMany(expenseTags);
    }

    return {
      success: true,
      data: expense.toPlainObject(),
    };
  }
}
