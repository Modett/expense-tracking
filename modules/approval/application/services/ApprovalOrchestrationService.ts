import type { IApprovalCommandRepository } from "../../domain/repositories/IApprovalCommandRepository.js";
import type { IApprovalRuleQueryRepository } from "../../../approval-rules/domain/repositories/IApprovalRuleQueryRepository.js";
import type { IUserQueryRepository } from "../../../user/domain/repositories/IUserQueryRepository.js";
import type { Expense } from "../../../expense-management/domain/entities/Expense.js";
import { Approval } from "../../domain/entities/Approval.js";
import {
  ApprovalOrder,
  ApprovalChainService,
  ExpenseId,
  UserId,
} from "../../domain/index.js";
import { Role } from "../../../user/domain/value-objects/Role.js";
import { CategoryId as ApprovalRuleCategoryId } from "../../../approval-rules/domain/value-objects/CategoryId.js";

export interface ApprovalCreationResult {
  created: number;
  approvalIds: string[];
  approverIds: string[];
  errors: string[];
}

/**
 * Orchestrates the creation of approvals based on approval rules
 * when an expense is submitted
 */
export class ApprovalOrchestrationService {
  constructor(
    private readonly approvalRuleQueryRepo: IApprovalRuleQueryRepository,
    private readonly userQueryRepo: IUserQueryRepository,
    private readonly approvalCommandRepo: IApprovalCommandRepository
  ) {}

  /**
   * Creates approvals for an expense based on applicable approval rules
   */
  async createApprovalsForExpense(
    expense: Expense
  ): Promise<ApprovalCreationResult> {
    const result: ApprovalCreationResult = {
      created: 0,
      approvalIds: [],
      approverIds: [],
      errors: [],
    };

    try {
      // Convert expense categoryId to approval-rules CategoryId using string value
      const categoryIdForRules = ApprovalRuleCategoryId.fromString(
        expense.categoryId.getValue()
      );

      // Find applicable approval rules for this expense
      const applicableRules =
        await this.approvalRuleQueryRepo.findApplicableRules(
          categoryIdForRules,
          expense.amount.getTotalValue()
        );

      if (applicableRules.length === 0) {
        result.errors.push(
          `No approval rules found for category ${expense.categoryId.getValue()} and amount ${expense.amount.getTotalValue()}`
        );
        return result;
      }

      // Sort rules by approval order to ensure correct sequence
      const sortedRules = [...applicableRules].sort(
        (a, b) => a.approvalOrder.getValue() - b.approvalOrder.getValue()
      );

      // Create approvals for each rule
      const approvals: Approval[] = [];

      for (const rule of sortedRules) {
        try {
          // Find a user with the required role
          const roleValue = rule.approverRole.getValue();
          const role = Role.fromString(roleValue);
          const usersWithRole = await this.userQueryRepo.findByRole(role, 1);

          if (usersWithRole.length === 0) {
            result.errors.push(
              `No active user found with role ${roleValue} for approval order ${rule.approvalOrder.getValue()}`
            );
            continue;
          }

          // Use the first available user with the required role
          const approver = usersWithRole[0];
          if (!approver) {
            result.errors.push(
              `No approver found with role ${roleValue} for approval order ${rule.approvalOrder.getValue()}`
            );
            continue;
          }

          // Determine initial status based on approval order
          const status = ApprovalChainService.getInitialStatus(
            rule.approvalOrder.getValue()
          );

          // Convert IDs from other modules to approval module value objects
          const expenseIdForApproval = ExpenseId.fromString(
            expense.id.getValue()
          );
          const approverIdForApproval = UserId.fromString(
            approver.id.getValue()
          );

          // Create the approval
          const approval = Approval.create({
            expenseId: expenseIdForApproval,
            approverId: approverIdForApproval,
            approvalOrder: ApprovalOrder.create(rule.approvalOrder.getValue()),
            status,
          });

          approvals.push(approval);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          result.errors.push(
            `Failed to create approval for rule ${rule.id.getValue()}: ${errorMessage}`
          );
        }
      }

      // Save all approvals in a batch
      if (approvals.length > 0) {
        const savedApprovals = await this.approvalCommandRepo.saveMany(
          approvals
        );
        result.created = savedApprovals.length;
        result.approvalIds = savedApprovals.map((a) => a.id.getValue());
        result.approverIds = savedApprovals.map((a) => a.approverId.getValue());
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Failed to create approvals: ${errorMessage}`);
      return result;
    }
  }

  /**
   * Validates that approval rules exist for an expense before submission
   */
  async validateApprovalRulesExist(expense: Expense): Promise<boolean> {
    // Convert expense categoryId to approval-rules CategoryId using string value
    const categoryIdForRules = ApprovalRuleCategoryId.fromString(
      expense.categoryId.getValue()
    );

    const applicableRules =
      await this.approvalRuleQueryRepo.findApplicableRules(
        categoryIdForRules,
        expense.amount.getTotalValue()
      );

    return applicableRules.length > 0;
  }

  /**
   * Gets the count of approvals that would be created for an expense
   */
  async getExpectedApprovalCount(expense: Expense): Promise<number> {
    // Convert expense categoryId to approval-rules CategoryId using string value
    const categoryIdForRules = ApprovalRuleCategoryId.fromString(
      expense.categoryId.getValue()
    );

    const applicableRules =
      await this.approvalRuleQueryRepo.findApplicableRules(
        categoryIdForRules,
        expense.amount.getTotalValue()
      );

    return applicableRules.length;
  }
}
