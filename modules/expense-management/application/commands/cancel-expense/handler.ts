import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import { ExpenseId } from "../../../domain/index.js";
import type { CancelExpenseCommand } from "./command.js";

export interface CancelExpenseResponse {
  success: boolean;
  expenseId: string;
  message: string;
}

export class CancelExpenseCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository
  ) {}

  async handle(command: CancelExpenseCommand): Promise<CancelExpenseResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    try {
      expense.cancel();

      await this.expenseCommandRepo.save(expense);

      return {
        success: true,
        expenseId: command.expenseId,
        message: command.cancelReason
          ? `Expense cancelled: ${command.cancelReason}`
          : "Expense cancelled successfully",
      };
    } catch (error) {
      throw new Error(`Failed to cancel expense: ${(error as Error).message}`);
    }
  }
}
