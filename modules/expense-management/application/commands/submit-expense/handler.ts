import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import { ExpenseId } from "../../../domain/index.js";
import type { SubmitExpenseCommand } from "./command.js";

export interface SubmitExpenseResponse {
  success: boolean;
  expenseId: string;
  message: string;
}

export class SubmitExpenseCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository
  ) {}

  async handle(command: SubmitExpenseCommand): Promise<SubmitExpenseResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    try {
      expense.submit();

      await this.expenseCommandRepo.save(expense);

      return {
        success: true,
        expenseId: command.expenseId,
        message: "Expense submitted successfully for approval",
      };
    } catch (error) {
      throw new Error(`Failed to submit expense: ${(error as Error).message}`);
    }
  }
}
