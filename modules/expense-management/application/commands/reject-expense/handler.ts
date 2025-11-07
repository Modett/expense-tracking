import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import { ExpenseId } from "../../../domain/index.js";
import type { RejectExpenseCommand } from "./command.js";

export interface RejectExpenseResponse {
  success: boolean;
  expenseId: string;
  message: string;
}

export class RejectExpenseCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository
  ) {}

  async handle(command: RejectExpenseCommand): Promise<RejectExpenseResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    try {
      expense.reject();

      await this.expenseCommandRepo.save(expense);

      return {
        success: true,
        expenseId: command.expenseId,
        message: `Expense rejected: ${command.rejectionReason}`,
      };
    } catch (error) {
      throw new Error(`Failed to reject expense: ${(error as Error).message}`);
    }
  }
}
