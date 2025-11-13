import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import type { ApprovalOrchestrationService } from "../../../../approval/application/services/ApprovalOrchestrationService.js";
import type { BudgetEnforcementService } from "../../services/BudgetEnforcementService.js";
import { ExpenseId, BudgetExceptionType } from "../../../domain/index.js";
import type { SubmitExpenseCommand } from "./command.js";

export interface SubmitExpenseResponse {
  success: boolean;
  expenseId: string;
  message: string;
  approvalsCreated?: number;
  approvalIds?: string[];
  approverIds?: string[];
  approvalErrors?: string[];
  budgetWarnings?: string[];
  budgetInfo?: {
    budgetAmount: number;
    spentAmount: number;
    remainingAmount: number;
    utilizationPercentage: number;
    projectedUtilization: number;
  };
}

export class SubmitExpenseCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository,
    private readonly approvalOrchestrationService: ApprovalOrchestrationService,
    private readonly budgetEnforcementService?: BudgetEnforcementService
  ) {}

  async handle(command: SubmitExpenseCommand): Promise<SubmitExpenseResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    try {
      // 0. Apply budget override and justification if provided
      // IMPORTANT: Set justification FIRST before budget override to pass validation
      if (command.justification !== undefined) {
        expense.updateJustification(command.justification);
      }
      if (command.budgetOverride) {
        const budgetOverrideVO = BudgetExceptionType.fromString(command.budgetOverride);
        expense.updateBudgetOverride(budgetOverrideVO);
      }

      // 1. Check budget constraints FIRST (after applying override/justification)
      let budgetCheckResult;
      let budgetWarnings: string[] = [];
      let budgetInfoToReturn;

      if (this.budgetEnforcementService) {
        budgetCheckResult =
          await this.budgetEnforcementService.checkBudgetForExpense(expense);

        // If budget is exceeded and no override is set, BLOCK submission
        if (!budgetCheckResult.canProceed) {
          throw new Error(
            `${budgetCheckResult.message}\n\nRequired actions:\n${budgetCheckResult.warnings.join(
              "\n"
            )}`
          );
        }

        // Collect warnings for response
        budgetWarnings = budgetCheckResult.warnings;
        budgetInfoToReturn = budgetCheckResult.budgetInfo;
      }

      // 2. Validate that approval rules exist before submitting
      const hasApprovalRules =
        await this.approvalOrchestrationService.validateApprovalRulesExist(
          expense
        );

      if (!hasApprovalRules) {
        throw new Error(
          `Cannot submit expense: No approval rules configured for category ${expense.categoryId.getValue()} and amount ${expense.amount.getTotalValue()}`
        );
      }

      // 3. Submit the expense (changes status to "submitted")
      expense.submit();
      await this.expenseCommandRepo.save(expense);

      // 4. Create approvals based on applicable rules
      const approvalResult =
        await this.approvalOrchestrationService.createApprovalsForExpense(
          expense
        );

      // 5. Build response with approval creation details
      let message = `Expense submitted successfully with ${approvalResult.created} approval(s) created`;

      // Add budget status to message if applicable
      if (budgetCheckResult) {
        if (budgetCheckResult.requiresOverride) {
          message += ` (Budget Override: ${expense.budgetOverride.getValue()})`;
        }
        if (budgetCheckResult.requiresExecutiveApproval) {
          message += " - Requires executive approval due to budget override";
        }
      }

      const response: SubmitExpenseResponse = {
        success: true,
        expenseId: command.expenseId,
        message,
        approvalsCreated: approvalResult.created,
        approvalIds: approvalResult.approvalIds,
        approverIds: approvalResult.approverIds,
      };

      // Include budget warnings if any
      if (budgetWarnings.length > 0) {
        response.budgetWarnings = budgetWarnings;
      }

      // Include budget info if available
      if (budgetInfoToReturn) {
        response.budgetInfo = budgetInfoToReturn;
      }

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
