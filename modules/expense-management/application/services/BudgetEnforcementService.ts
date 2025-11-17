import type { IBudgetQueryRepository } from "../../../budget/domain/repositories/IBudgetQueryRepository.js";
import { DepartmentId as BudgetDepartmentId } from "../../../budget/domain/value-objects/DepartmentId.js";
import { CategoryId as BudgetCategoryId } from "../../../budget/domain/value-objects/CategoryId.js";
import type { Expense } from "../../domain/entities/Expense.js";
import { BudgetExceptionTypeEnum } from "../../domain/value-objects/BudgetExceptionType.js";

export enum BudgetCheckResult {
  WITHIN_BUDGET = "WITHIN_BUDGET",
  BUDGET_WARNING_80 = "BUDGET_WARNING_80",
  BUDGET_ALERT_90 = "BUDGET_ALERT_90",
  BUDGET_EXCEEDED = "BUDGET_EXCEEDED",
  NO_BUDGET_FOUND = "NO_BUDGET_FOUND",
}

export interface BudgetCheckResponse {
  result: BudgetCheckResult;
  canProceed: boolean;
  requiresOverride: boolean;
  requiresJustification: boolean;
  requiresExecutiveApproval: boolean;
  budgetInfo?: {
    budgetId: string;
    budgetAmount: number;
    spentAmount: number;
    remainingAmount: number;
    utilizationPercentage: number;
    expenseAmount: number;
    projectedUtilization: number;
  };
  message: string;
  warnings: string[];
}

/**
 * BudgetEnforcementService
 *
 * Enforces budget constraints before expense submission.
 * Implements the budget override workflow based on your requirements:
 *
 * - Checks if expense fits within available budget
 * - Issues warnings at 80%, 90% thresholds
 * - Requires budget override and justification when exceeding budget
 * - Determines approval workflow based on budget status
 */
export class BudgetEnforcementService {
  constructor(private readonly budgetQueryRepo: IBudgetQueryRepository) {}

  /**
   * Check if an expense can proceed based on budget availability
   * Returns detailed information about budget status and requirements
   */
  async checkBudgetForExpense(expense: Expense): Promise<BudgetCheckResponse> {
    try {
      console.log("[BudgetEnforcement] Starting budget check for expense", {
        expenseId: expense.id.getValue(),
        departmentId: expense.departmentId?.getValue(),
        categoryId: expense.categoryId.getValue(),
        amount: expense.amount.getTotalValue(),
      });

      // If no department, allow (for personal/startup use cases)
      if (!expense.hasDepartment()) {
        console.log("[BudgetEnforcement] No department - allowing expense");
        return {
          result: BudgetCheckResult.NO_BUDGET_FOUND,
          canProceed: true,
          requiresOverride: false,
          requiresJustification: false,
          requiresExecutiveApproval: false,
          message:
            "No department assigned - expense allowed (personal/startup mode)",
          warnings: [],
        };
      }

      // Find active budget for this department/category
      const budget = await this.findApplicableBudget(expense);

      if (!budget) {
        console.log(
          "[BudgetEnforcement] No applicable budget found - allowing expense"
        );
        return {
          result: BudgetCheckResult.NO_BUDGET_FOUND,
          canProceed: true,
          requiresOverride: false,
          requiresJustification: false,
          requiresExecutiveApproval: false,
          message:
            "No active budget found for this department/category - expense allowed by default",
          warnings: [
            "Consider creating a budget for better financial tracking",
          ],
        };
      }

      console.log("[BudgetEnforcement] Budget found!", {
        budgetId: budget.id.getValue(),
        budgetAmount: budget.amount.getBudgetAmount(),
        spentAmount: budget.amount.getSpentAmount(),
        remainingAmount: budget.getRemainingAmount(),
        enforcementType: budget.enforcementType.getValue(),
      });

      const expenseAmount = expense.amount.getTotalValue();
      const budgetAmount = budget.amount.getBudgetAmount();
      const spentAmount = budget.amount.getSpentAmount();
      const remainingAmount = budget.getRemainingAmount();
      const currentUtilization = budget.getUtilizationPercentage();
      const projectedSpent = spentAmount + expenseAmount;
      const projectedUtilization = (projectedSpent / budgetAmount) * 100;

      const budgetInfo = {
        budgetId: budget.id.getValue(),
        budgetAmount,
        spentAmount,
        remainingAmount,
        utilizationPercentage: currentUtilization,
        expenseAmount,
        projectedUtilization,
      };

      // Check if expense exceeds available budget
      if (expenseAmount > remainingAmount) {
        console.log("[BudgetEnforcement] Budget exceeded!", {
          expenseAmount,
          remainingAmount,
          budgetId: budget.id.getValue(),
          enforcementType: budget.enforcementType.getValue(),
          overrideAllowed: budget.overrideAllowed,
          budgetOverride: expense.budgetOverride.getValue(),
        });

        // Soft enforcement allows expenses to proceed without overrides
        if (budget.enforcementType.isSoft()) {
          console.log("[BudgetEnforcement] SOFT enforcement - allowing overage");
          const overageAmount = expenseAmount - remainingAmount;
          return {
            result: BudgetCheckResult.BUDGET_EXCEEDED,
            canProceed: true,
            requiresOverride: false,
            requiresJustification: false,
            requiresExecutiveApproval: false,
            budgetInfo,
            message: `Budget exceeded by ${overageAmount.toFixed(
              2
            )}, but soft enforcement allows this expense.`,
            warnings: [
              "Soft enforcement: no override required",
              "Finance team will be notified of the overage",
              "Consider creating an override only if you need additional tracking",
            ],
          };
        }

        return this.handleBudgetExceeded(
          expense,
          budgetInfo,
          expenseAmount,
          remainingAmount,
          budget
        );
      }

      // Check warning thresholds
      if (projectedUtilization >= 90) {
        return {
          result: BudgetCheckResult.BUDGET_ALERT_90,
          canProceed: true,
          requiresOverride: false,
          requiresJustification: false,
          requiresExecutiveApproval: false,
          budgetInfo,
          message: `Budget Alert: This expense will push utilization to ${projectedUtilization.toFixed(
            1
          )}% (90% threshold exceeded)`,
          warnings: [
            "Budget is at 90%+ utilization - consider budget review",
            "Notify department head and finance team",
          ],
        };
      }

      if (projectedUtilization >= 80) {
        return {
          result: BudgetCheckResult.BUDGET_WARNING_80,
          canProceed: true,
          requiresOverride: false,
          requiresJustification: false,
          requiresExecutiveApproval: false,
          budgetInfo,
          message: `Budget Warning: This expense will push utilization to ${projectedUtilization.toFixed(
            1
          )}% (80% threshold exceeded)`,
          warnings: ["Budget is at 80%+ utilization - monitor closely"],
        };
      }

      // Within budget - all good
      return {
        result: BudgetCheckResult.WITHIN_BUDGET,
        canProceed: true,
        requiresOverride: false,
        requiresJustification: false,
        requiresExecutiveApproval: false,
        budgetInfo,
        message: `Expense within budget. Remaining: ${remainingAmount.toFixed(
          2
        )} after this expense`,
        warnings: [],
      };
    } catch (error) {
      console.error("[BudgetEnforcementService] Error checking budget:", error);
      // On error, allow the expense but log warning
      return {
        result: BudgetCheckResult.NO_BUDGET_FOUND,
        canProceed: true,
        requiresOverride: false,
        requiresJustification: false,
        requiresExecutiveApproval: false,
        message: "Budget check failed - allowing expense by default",
        warnings: [
          `Budget check error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
      };
    }
  }

  /**
   * Handle case where expense exceeds available budget
   */
  private handleBudgetExceeded(
    expense: Expense,
    budgetInfo: any,
    expenseAmount: number,
    remainingAmount: number,
    budget: any
  ): BudgetCheckResponse {
    const overageAmount = expenseAmount - remainingAmount;
    const budgetOverrideType = expense.budgetOverride.getValue();
    const isHardEnforcement = budget.enforcementType.isHard();
    const overrideAllowed = budget.overrideAllowed;

    // HARD enforcement: Block immediately - overrides must go through approval workflow
    if (isHardEnforcement) {
      console.log("[BudgetEnforcement] HARD enforcement detected!", {
        budgetOverrideType,
        overrideAllowed,
        overageAmount,
      });

      // If overrides are not allowed at all, block completely
      if (!overrideAllowed) {
        console.log("[BudgetEnforcement] BLOCKING - No override allowed");
        return {
          result: BudgetCheckResult.BUDGET_EXCEEDED,
          canProceed: false,
          requiresOverride: false,
          requiresJustification: false,
          requiresExecutiveApproval: false,
          budgetInfo,
          message: `BLOCKED: Budget exceeded by ₹${overageAmount.toFixed(
            2
          )}. Hard enforcement - no overrides allowed.`,
          warnings: [
            "This budget has HARD enforcement with no override permissions",
            "Contact finance/admin to increase budget allocation",
          ],
        };
      }

      // Overrides are allowed, but check if override is provided
      if (budgetOverrideType === BudgetExceptionTypeEnum.NONE) {
        console.log("[BudgetEnforcement] BLOCKING - Override required");
        return {
          result: BudgetCheckResult.BUDGET_EXCEEDED,
          canProceed: false,
          requiresOverride: true,
          requiresJustification: true,
          requiresExecutiveApproval: true,
          budgetInfo,
          message: `BLOCKED: Expense exceeds budget by ₹${overageAmount.toFixed(
            2
          )}. Hard enforcement - override required.`,
          warnings: [
            "You must set a budget override type (emergency, annual, or recurring)",
            "Justification is required (minimum 50 characters)",
            "This will trigger executive approval workflow",
          ],
        };
      }

      // Override is provided - validate justification
      if (
        expense.budgetOverride.requiresJustification() &&
        !expense.justification
      ) {
        console.log("[BudgetEnforcement] BLOCKING - Justification required");
        return {
          result: BudgetCheckResult.BUDGET_EXCEEDED,
          canProceed: false,
          requiresOverride: true,
          requiresJustification: true,
          requiresExecutiveApproval: true,
          budgetInfo,
          message: `BLOCKED: Budget override requires justification. Overage: ₹${overageAmount.toFixed(
            2
          )}`,
          warnings: [
            "Justification is mandatory for budget overrides",
            "Minimum 50 characters explaining why this expense exceeds budget",
          ],
        };
      }

      // HARD enforcement with valid override: Allow submission but ALWAYS require executive approval
      console.log(
        "[BudgetEnforcement] HARD enforcement - Allowing with MANDATORY executive approval"
      );
      return {
        result: BudgetCheckResult.BUDGET_EXCEEDED,
        canProceed: true, // ALLOW submission for HARD enforcement with valid override
        requiresOverride: true,
        requiresJustification: true,
        requiresExecutiveApproval: true, // Always require executive approval for HARD enforcement
        budgetInfo,
        message: `Budget Override Approved (HARD enforcement): Expense exceeds budget by ₹${overageAmount.toFixed(
          2
        )}. Override type: ${budgetOverrideType}`,
        warnings: [
          "Hard enforcement: Mandatory CFO/CEO approval required",
          `Override type: ${budgetOverrideType}`,
          "This will trigger executive approval workflow before processing",
          "Budget overage will be logged in audit trail",
        ],
      };
    }

    // SOFT enforcement or override provided: Check if budget override is set
    if (budgetOverrideType === BudgetExceptionTypeEnum.NONE) {
      return {
        result: BudgetCheckResult.BUDGET_EXCEEDED,
        canProceed: false,
        requiresOverride: true,
        requiresJustification: true,
        requiresExecutiveApproval: true,
        budgetInfo,
        message: `BLOCKED: Expense exceeds budget by ₹${overageAmount.toFixed(
          2
        )}. Budget override required.`,
        warnings: [
          "You must set a budget override type (emergency, annual, or recurring)",
          "Justification is required (minimum 50 characters)",
          "This will trigger executive approval workflow",
        ],
      };
    }

    // Budget override is set - validate justification
    if (
      expense.budgetOverride.requiresJustification() &&
      !expense.justification
    ) {
      return {
        result: BudgetCheckResult.BUDGET_EXCEEDED,
        canProceed: false,
        requiresOverride: true,
        requiresJustification: true,
        requiresExecutiveApproval: true,
        budgetInfo,
        message: `BLOCKED: Budget override requires justification. Overage: ${overageAmount.toFixed(
          2
        )}`,
        warnings: [
          "Justification is mandatory for budget overrides",
          "Minimum 50 characters explaining why this expense exceeds budget",
        ],
      };
    }

    // Override is properly set with justification - allow but flag for special approval
    return {
      result: BudgetCheckResult.BUDGET_EXCEEDED,
      canProceed: true,
      requiresOverride: true,
      requiresJustification: true,
      requiresExecutiveApproval:
        expense.budgetOverride.requiresExecutiveApproval(),
      budgetInfo,
      message: `Budget Override Approved: Expense exceeds budget by ${overageAmount.toFixed(
        2
      )}. Override type: ${budgetOverrideType}`,
      warnings: [
        "This expense will trigger special approval workflow",
        expense.budgetOverride.requiresExecutiveApproval()
          ? "Requires CFO/CEO approval"
          : "Requires Finance Director approval",
        "Budget overage will be logged in audit trail",
      ],
    };
  }

  /**
   * Find the applicable budget for an expense
   * Checks both category-specific and department-wide budgets
   */
  private async findApplicableBudget(expense: Expense) {
    if (!expense.hasDepartment()) {
      return null;
    }

    const budgetDepartmentId = BudgetDepartmentId.fromString(
      expense.departmentId!.getValue()
    );
    const budgetCategoryId = BudgetCategoryId.fromString(
      expense.categoryId.getValue()
    );

    // Get expense date to find correct fiscal period
    const expenseDate = expense.dateOfExpense.getValue();

    // Get all budgets for this department
    const budgets = await this.budgetQueryRepo.findByDepartmentId(
      budgetDepartmentId
    );

    if (!budgets || budgets.length === 0) {
      return null;
    }

    // Find active budget that:
    // 1. Covers the expense date
    // 2. Matches category (if category-specific budget exists)
    // 3. Or is department-wide budget (categoryId is null)
    const applicableBudgets = budgets.filter((budget: any) => {
      const budgetPeriod = budget.period;
      const startDate = budgetPeriod.getStartDate();
      const endDate = budgetPeriod.getEndDate();

      const isInPeriod =
        budget.isActive && expenseDate >= startDate && expenseDate <= endDate;

      if (!isInPeriod) return false;

      // Prefer category-specific budget if available
      if (budget.categoryId) {
        return budget.belongsToCategory(budgetCategoryId);
      }

      // Otherwise, use department-wide budget
      return true;
    });

    if (applicableBudgets.length === 0) {
      return null;
    }

    // Prefer category-specific budget over department-wide
    const categorySpecificBudget = applicableBudgets.find(
      (b: any) => b.categoryId !== null
    );
    return categorySpecificBudget || applicableBudgets[0];
  }

  /**
   * Validate that budget override is properly configured
   */
  validateBudgetOverride(expense: Expense): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const budgetOverride = expense.budgetOverride;

    if (budgetOverride.requiresJustification() && !expense.justification) {
      errors.push(
        `Budget override type "${budgetOverride.getValue()}" requires justification`
      );
    }

    if (
      expense.justification &&
      budgetOverride.requiresJustification() &&
      expense.justification.length < 50
    ) {
      errors.push("Justification must be at least 50 characters");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
