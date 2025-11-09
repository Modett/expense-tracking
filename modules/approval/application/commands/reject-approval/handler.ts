import type { IApprovalCommandRepository } from "../../../domain/repositories/IApprovalCommandRepository.js";
import type { IApprovalQueryRepository } from "../../../domain/repositories/IApprovalQueryRepository.js";
import { ApprovalId, UserId, ApprovalComments } from "../../../domain/index.js";
import type { RejectApprovalCommand } from "./command.js";
import type { ExpenseOrchestrationService } from "../../../../expense-management/application/services/ExpenseOrchestrationService.js";

export interface RejectApprovalResponse {
  success: boolean;
  approvalId: string;
}

export class RejectApprovalCommandHandler {
  constructor(
    private readonly approvalQueryRepo: IApprovalQueryRepository,
    private readonly approvalCommandRepo: IApprovalCommandRepository,
    private readonly expenseOrchestrationService?: ExpenseOrchestrationService | null
  ) {}

  async handle(
    command: RejectApprovalCommand
  ): Promise<RejectApprovalResponse> {
    const approvalId = ApprovalId.fromString(command.approvalId);
    const approverId = UserId.fromString(command.approverId);

    const approval = await this.approvalQueryRepo.findById(approvalId);
    if (!approval) {
      throw new Error(`Approval with ID ${command.approvalId} not found`);
    }

    // Verify the approver is authorized
    if (!approval.isApprovedBy(approverId)) {
      throw new Error("You are not authorized to reject this approval request");
    }

    const comments = command.comments
      ? ApprovalComments.create(command.comments)
      : undefined;

    approval.reject(comments);

    await this.approvalCommandRepo.save(approval);

    // Skip all remaining waiting approvals for this expense
    const allApprovals = await this.approvalQueryRepo.findByExpenseId(
      approval.expenseId
    );

    const skipComments = ApprovalComments.create(
      "Automatically skipped due to earlier rejection"
    );

    for (const otherApproval of allApprovals) {
      // Skip the approval we just rejected
      if (otherApproval.id.equals(approval.id)) {
        continue;
      }

      if (otherApproval.status.isWaiting()) {
        // Activate it first so we can skip it (business rule: can only skip pending approvals)
        otherApproval.activate();
        otherApproval.skip(skipComments);
        await this.approvalCommandRepo.save(otherApproval);
      }
    }

    // Mark expense as rejected
    if (this.expenseOrchestrationService) {
      try {
        const expenseResult =
          await this.expenseOrchestrationService.markExpenseAsRejected(
            approval.expenseId.getValue(),
            comments?.getValue()
          );

        if (!expenseResult.success) {
          console.error(
            `Failed to mark expense as rejected: ${expenseResult.error}`
          );
        }
      } catch (error) {
        console.error(`Error marking expense as rejected:`, error);
      }
    }

    return {
      success: true,
      approvalId: approval.id.getValue(),
    };
  }
}
