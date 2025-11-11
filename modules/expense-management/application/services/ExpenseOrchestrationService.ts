import type { IExpenseCommandRepository } from "../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../domain/repositories/IExpenseQueryRepository.js";
import { ExpenseId } from "../../domain/value-objects/ExpenseId.js";
import type { IBudgetQueryRepository } from "../../../budget/domain/repositories/IBudgetQueryRepository.js";
import type { IBudgetCommandRepository } from "../../../budget/domain/repositories/IBudgetCommandRepository.js";
import { DepartmentId as BudgetDepartmentId } from "../../../budget/domain/value-objects/DepartmentId.js";
import { FiscalPeriod } from "../../../budget/domain/value-objects/FiscalPeriod.js";

export class ExpenseOrchestrationService {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository,
    private readonly budgetQueryRepo?: IBudgetQueryRepository,
    private readonly budgetCommandRepo?: IBudgetCommandRepository
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

      // Update budget spent amount
      await this.updateBudgetForApprovedExpense(expense);

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Updates the budget spent amount when an expense is approved
   */
  private async updateBudgetForApprovedExpense(expense: any): Promise<void> {
    if (!this.budgetQueryRepo || !this.budgetCommandRepo) {
      console.warn(
        "[ExpenseOrchestration] Budget repositories not available, skipping budget update"
      );
      return;
    }

    try {
      const budgetDepartmentId = BudgetDepartmentId.fromString(
        expense.departmentId.getValue()
      );

      // Get all active budgets for the department
      const budgets = await this.budgetQueryRepo.findByDepartmentId(
        budgetDepartmentId
      );

      if (!budgets || budgets.length === 0) {
        console.warn(
          `[ExpenseOrchestration] No budgets found for department ${budgetDepartmentId.getValue()}`
        );
        return;
      }

      // Find an active budget that contains the expense date
      const expenseDate = expense.dateOfExpense.getValue();
      console.log(
        `[ExpenseOrchestration] Looking for active budget for date: ${expenseDate.toISOString()}`
      );

      const activeBudget = budgets.find((budget: any) => {
        const budgetPeriod = budget.period;
        const startDate = budgetPeriod.getStartDate();
        const endDate = budgetPeriod.getEndDate();

        console.log(
          `[ExpenseOrchestration] Checking budget ${budget.id.getValue()}: isActive=${
            budget.isActive
          }, period=${startDate.toISOString()} to ${endDate.toISOString()}`
        );

        return (
          budget.isActive && expenseDate >= startDate && expenseDate <= endDate
        );
      });

      if (!activeBudget) {
        console.warn(
          `[ExpenseOrchestration] No active budget found for department ${budgetDepartmentId.getValue()} covering date ${expenseDate.toISOString()}`
        );
        return;
      }

      // Add the expense amount to the budget spent
      const expenseAmount = expense.amount.getTotalValue();
      console.log(
        `[ExpenseOrchestration] Adding ${expenseAmount} to budget ${activeBudget.id.getValue()} (Period: ${activeBudget.fiscalPeriod.getValue()})`
      );

      activeBudget.addSpent(expenseAmount);
      await this.budgetCommandRepo.save(activeBudget);

      console.log(
        `[ExpenseOrchestration] Budget updated. New spent: ${activeBudget.amount.getSpentAmount()}`
      );
    } catch (error) {
      console.error("[ExpenseOrchestration] Error updating budget:", error);
      // Don't throw - budget update failure shouldn't fail expense approval
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
