import type { IExpenseCommandRepository } from "../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../domain/repositories/IExpenseQueryRepository.js";
import { ExpenseId } from "../../domain/value-objects/ExpenseId.js";

export class ExpenseOrchestrationService {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository
  ) {}

  /**
   * Mark expense as approved after all approvals are complete
   */
  async markExpenseAsApproved(
    expenseId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const expenseIdVO = ExpenseId.fromString(expenseId);
      const expense = await this.expenseQueryRepo.findById(expenseIdVO);

      if (!expense) {
        return { success: false, error: `Expense ${expenseId} not found` };
      }

      // Approve the expense
      expense.approve();

      // Save the updated expense
      await this.expenseCommandRepo.save(expense);

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Mark expense as rejected when any approval is rejected
   */
  async markExpenseAsRejected(
    expenseId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const expenseIdVO = ExpenseId.fromString(expenseId);
      const expense = await this.expenseQueryRepo.findById(expenseIdVO);

      if (!expense) {
        return { success: false, error: `Expense ${expenseId} not found` };
      }

      // Reject the expense
      expense.reject();

      // Save the updated expense
      await this.expenseCommandRepo.save(expense);

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }
}
