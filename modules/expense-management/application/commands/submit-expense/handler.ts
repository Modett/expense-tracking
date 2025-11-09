import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import type { ApprovalOrchestrationService } from "../../../../approval/application/services/ApprovalOrchestrationService.js";
import { ExpenseId } from "../../../domain/index.js";
import type { SubmitExpenseCommand } from "./command.js";

export interface SubmitExpenseResponse {
  success: boolean;
  expenseId: string;
  message: string;
  approvalsCreated?: number;
  approvalIds?: string[];
  approverIds?: string[];
  approvalErrors?: string[];
}

export class SubmitExpenseCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository,
    private readonly approvalOrchestrationService: ApprovalOrchestrationService
  ) {}

  async handle(command: SubmitExpenseCommand): Promise<SubmitExpenseResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    try {
      // Validate that approval rules exist before submitting
      const hasApprovalRules =
        await this.approvalOrchestrationService.validateApprovalRulesExist(
          expense
        );

      if (!hasApprovalRules) {
        throw new Error(
          `Cannot submit expense: No approval rules configured for category ${expense.categoryId.getValue()} and amount ${expense.amount.getTotalValue()}`
        );
      }

      // Submit the expense (changes status to "submitted")
      expense.submit();
      await this.expenseCommandRepo.save(expense);

      // Create approvals based on applicable rules
      const approvalResult =
        await this.approvalOrchestrationService.createApprovalsForExpense(
          expense
        );

      // Build response with approval creation details
      const response: SubmitExpenseResponse = {
        success: true,
        expenseId: command.expenseId,
        message: `Expense submitted successfully with ${approvalResult.created} approval(s) created`,
        approvalsCreated: approvalResult.created,
        approvalIds: approvalResult.approvalIds,
        approverIds: approvalResult.approverIds,
      };

      // Include errors if any occurred during approval creation
      if (approvalResult.errors.length > 0) {
        response.approvalErrors = approvalResult.errors;
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to submit expense: ${(error as Error).message}`);
    }
  }
}
