import type { IApprovalCommandRepository } from "../../domain/repositories/IApprovalCommandRepository.js";
import type { IApprovalRuleQueryRepository } from "../../../approval-rules/domain/repositories/IApprovalRuleQueryRepository.js";
import type { IUserQueryRepository } from "../../../user/domain/repositories/IUserQueryRepository.js";
import type { Expense } from "../../../expense-management/domain/entities/Expense.js";
import type { User } from "../../../user/domain/entities/User.js";
import { Approval } from "../../domain/entities/Approval.js";
import {
  ApprovalOrder,
  ApprovalChainService,
  ApprovalStatus,
  ExpenseId,
  UserId,
} from "../../domain/index.js";
import { Role } from "../../../user/domain/value-objects/Role.js";
import { UserId as DomainUserId } from "../../../user/domain/value-objects/UserId.js";
import { CategoryId as ApprovalRuleCategoryId } from "../../../approval-rules/domain/value-objects/CategoryId.js";

export interface ApprovalCreationResult {
  created: number;
  approvalIds: string[];
  approverIds: string[];
  errors: string[];
}

export class ApprovalOrchestrationService {
  constructor(
    private readonly approvalRuleQueryRepo: IApprovalRuleQueryRepository,
    private readonly userQueryRepo: IUserQueryRepository,
    private readonly approvalCommandRepo: IApprovalCommandRepository
  ) {}

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
      const categoryIdForRules = ApprovalRuleCategoryId.fromString(
        expense.categoryId.getValue()
      );

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

      const sortedRules = [...applicableRules].sort(
        (a, b) => a.approvalOrder.getValue() - b.approvalOrder.getValue()
      );

      const approvals: Approval[] = [];
      const expenseOwner = await this.userQueryRepo.findById(
        DomainUserId.fromString(expense.userId.getValue())
      );

      for (const rule of sortedRules) {
        try {
          const roleValue = rule.approverRole.getValue();
          const role = Role.fromString(roleValue);

          const candidateApprovers: User[] = [];

          if (
            expenseOwner &&
            expenseOwner.isActive() &&
            expenseOwner.role.equals(role)
          ) {
            candidateApprovers.push(expenseOwner);
          }

          const usersWithRole = await this.userQueryRepo.findByRole(role);
          for (const user of usersWithRole) {
            if (!user.isActive()) {
              continue;
            }

            const alreadyIncluded = candidateApprovers.some((candidate) =>
              candidate.id.equals(user.id)
            );

            if (!alreadyIncluded) {
              candidateApprovers.push(user);
            }
          }

          if (candidateApprovers.length === 0) {
            result.errors.push(
              `No approver found with role ${roleValue} for approval order ${rule.approvalOrder.getValue()}`
            );
            continue;
          }

          for (const approver of candidateApprovers) {
            const defaultStatus = ApprovalChainService.getInitialStatus(
              rule.approvalOrder.getValue()
            );
            const status =
              approvals.length === 0
                ? ApprovalStatus.pending()
                : defaultStatus;

            const expenseIdForApproval = ExpenseId.fromString(
              expense.id.getValue()
            );
            const approverIdForApproval = UserId.fromString(
              approver.id.getValue()
            );

            const approval = Approval.create({
              expenseId: expenseIdForApproval,
              approverId: approverIdForApproval,
              approvalOrder: ApprovalOrder.create(rule.approvalOrder.getValue()),
              status,
            });

            approvals.push(approval);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          result.errors.push(
            `Failed to create approval for rule ${rule.id.getValue()}: ${errorMessage}`
          );
        }
      }      if (approvals.length > 0) {
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

  async validateApprovalRulesExist(expense: Expense): Promise<boolean> {
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

  async getExpectedApprovalCount(expense: Expense): Promise<number> {
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

