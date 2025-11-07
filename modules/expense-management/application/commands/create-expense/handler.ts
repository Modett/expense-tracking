import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import {
  Expense,
  UserId,
  VendorId,
  CategoryId,
  DepartmentId,
  ExpenseDescription,
  ExpenseAmount,
  DateOfExpense,
  Receipt,
} from "../../../domain/index.js";
import type { CreateExpenseCommand } from "./command.js";

export interface CreateExpenseResponse {
  success: boolean;
  expenseId: string;
}

export class CreateExpenseCommandHandler {
  constructor(private readonly expenseCommandRepo: IExpenseCommandRepository) {}

  async handle(command: CreateExpenseCommand): Promise<CreateExpenseResponse> {
    const userId = UserId.fromString(command.userId);
    const vendorId = VendorId.fromString(command.vendorId);
    const categoryId = CategoryId.fromString(command.categoryId);
    const departmentId = DepartmentId.fromString(command.departmentId);
    const description = ExpenseDescription.create(command.description);
    const amount = ExpenseAmount.create(
      command.netAmount,
      command.taxAmount,
      command.totalAmount
    );
    const dateOfExpense = DateOfExpense.create(command.expenseDate);

    const receipt = command.receiptUrl
      ? Receipt.create(command.receiptUrl)
      : undefined;

    const expenseProps: any = {
      userId,
      vendorId,
      categoryId,
      departmentId,
      description,
      amount,
      dateOfExpense,
      tagIds: [],
    };

    if (receipt) {
      expenseProps.receipt = receipt;
    }

    const expense = Expense.create(expenseProps);

    await this.expenseCommandRepo.save(expense);

    return {
      success: true,
      expenseId: expense.id.getValue(),
    };
  }
}
