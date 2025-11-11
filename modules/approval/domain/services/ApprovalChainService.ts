import type { Approval } from "../entities/Approval.js";
import { ApprovalStatus } from "../value-objects/ApprovalStatus.js";

export interface ApprovalRuleDTO {
  ruleId: string;
  categoryId: string;
  minAmount: number;
  approverRole: string;
  approvalOrder: number;
  isActive: boolean;
}

export class ApprovalChainService {
  /**
   * Determines the initial status for an approval based on its order
   * First approval (order 1) is PENDING, others are WAITING
   */
  static getInitialStatus(approvalOrder: number): ApprovalStatus {
    return approvalOrder === 1
      ? ApprovalStatus.pending()
      : ApprovalStatus.waiting();
  }

  /**
   * Sorts approval rules by approval order (ascending)
   */
  static sortRulesByOrder(rules: ApprovalRuleDTO[]): ApprovalRuleDTO[] {
    return [...rules].sort((a, b) => a.approvalOrder - b.approvalOrder);
  }

  /**
   * Checks if an approval can be approved based on its status
   */
  static canApprove(approval: Approval): boolean {
    return approval.status.canBeApproved();
  }

  /**
   * Checks if an approval can be activated (transitioned from WAITING to PENDING)
   */
  static canActivate(approval: Approval): boolean {
    return approval.status.canBeActivated();
  }

  /**
   * Validates that all previous approvals in the chain are approved
   * before activating the next one
   */
  static validateApprovalSequence(
    currentApproval: Approval,
    allApprovalsForExpense: Approval[]
  ): boolean {
    const currentOrder = currentApproval.approvalOrder.getValue();

    // Get all approvals with lower order numbers
    const previousApprovals = allApprovalsForExpense.filter(
      (a) => a.approvalOrder.getValue() < currentOrder
    );

    // Check if all previous approvals are approved
    return previousApprovals.every((a) => a.status.isApproved());
  }

  static findNextApproval(
    currentApprovalOrder: number,
    allApprovalsForExpense: Approval[]
  ): Approval | null {
    const nextApprovals = allApprovalsForExpense
      .filter((a) => a.approvalOrder.getValue() > currentApprovalOrder)
      .sort((a, b) => a.approvalOrder.getValue() - b.approvalOrder.getValue());

    return nextApprovals.length > 0 ? nextApprovals[0] ?? null : null;
  }

  static areAllApprovalsCompleted(approvals: Approval[]): boolean {
    return approvals.every((a) => a.status.isFinal());
  }

  static areAllApprovalsApproved(approvals: Approval[]): boolean {
    return approvals.every((a) => a.status.isApproved());
  }

  static hasAnyRejection(approvals: Approval[]): boolean {
    return approvals.some((a) => a.status.isRejected());
  }
}
