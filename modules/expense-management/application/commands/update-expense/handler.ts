import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import {
  ExpenseId,
  VendorId,
  CategoryId,
  DepartmentId,
  ExpenseDescription,
  ExpenseAmount,
  DateOfExpense,
  Receipt,
} from "../../../domain/index.js";
import type { UpdateExpenseCommand } from "./command.js";

export interface UpdateExpenseResponse {
  success: boolean;
  expenseId: string;
}

export class UpdateExpenseCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository
  ) {}

  async handle(command: UpdateExpenseCommand): Promise<UpdateExpenseResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    if (command.description !== undefined) {
      const description = ExpenseDescription.create(command.description);
      expense.updateDescription(description);
    }

    if (command.vendorId !== undefined) {
      const vendorId = VendorId.fromString(command.vendorId);
      expense.updateVendor(vendorId);
    }

    if (command.categoryId !== undefined) {
      const categoryId = CategoryId.fromString(command.categoryId);
      expense.updateCategory(categoryId);
    }

    if (command.departmentId !== undefined) {
      const departmentId = DepartmentId.fromString(command.departmentId);
      expense.updateDepartment(departmentId);
    }

    if (
      command.netAmount !== undefined &&
      command.taxAmount !== undefined &&
      command.totalAmount !== undefined
    ) {
      const amount = ExpenseAmount.create(
        command.netAmount,
        command.taxAmount,
        command.totalAmount
      );
      expense.updateAmount(amount);
    }

    if (command.expenseDate !== undefined) {
      const dateOfExpense = DateOfExpense.create(command.expenseDate);
      expense.updateDateOfExpense(dateOfExpense);
    }

    if (command.receiptUrl !== undefined) {
      if (command.receiptUrl) {
        const receipt = Receipt.create(command.receiptUrl);
        expense.attachReceipt(receipt);
      } else {
        expense.removeReceipt();
      }
    }

    await this.expenseCommandRepo.save(expense);

    return {
      success: true,
      expenseId: command.expenseId,
    };
  }
}
