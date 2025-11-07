import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import { ExpenseId } from "../../../domain/index.js";
import type { DeleteExpenseCommand } from "./command.js";

export interface DeleteExpenseResponse {
  success: boolean;
  expenseId: string;
  message: string;
}

export class DeleteExpenseCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository
  ) {}

  async handle(command: DeleteExpenseCommand): Promise<DeleteExpenseResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    if (!expense.status.canBeEdited() && !expense.status.isRejected()) {
      throw new Error(
        `Cannot delete expense: expense is ${expense.status.toString()}. Only draft or rejected expenses can be deleted.`
      );
    }

    await this.expenseCommandRepo.delete(expenseId);

    return {
      success: true,
      expenseId: command.expenseId,
      message: "Expense deleted successfully",
    };
  }
}
