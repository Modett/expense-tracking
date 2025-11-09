import type { IApprovalCommandRepository } from "../../../domain/repositories/IApprovalCommandRepository.js";
import type { IApprovalQueryRepository } from "../../../domain/repositories/IApprovalQueryRepository.js";
import {
  ApprovalId,
  UserId,
  ApprovalComments,
  ApprovalChainService,
  ExpenseId,
} from "../../../domain/index.js";
import type { ApproveApprovalCommand } from "./command.js";
import type { ExpenseOrchestrationService } from "../../../../expense-management/application/services/ExpenseOrchestrationService.js";

// Purchase Order type (when module exists)
interface PurchaseOrderOrchestrationService {
  createPurchaseOrderFromExpense: (
    expenseId: string
  ) => Promise<{ success: boolean; purchaseOrderId?: string; error?: string }>;
}

export interface ApproveApprovalResponse {
  success: boolean;
  approvalId: string;
  purchaseOrderCreated?: boolean;
  purchaseOrderId?: string;
}

export class ApproveApprovalCommandHandler {
  constructor(
    private readonly approvalQueryRepo: IApprovalQueryRepository,
    private readonly approvalCommandRepo: IApprovalCommandRepository,
    private readonly purchaseOrderOrchestrationService?: PurchaseOrderOrchestrationService | null,
    private readonly expenseOrchestrationService?: ExpenseOrchestrationService | null
  ) {}

  async handle(
    command: ApproveApprovalCommand
  ): Promise<ApproveApprovalResponse> {
    const approvalId = ApprovalId.fromString(command.approvalId);
    const approverId = UserId.fromString(command.approverId);

    const approval = await this.approvalQueryRepo.findById(approvalId);
    if (!approval) {
      throw new Error(`Approval with ID ${command.approvalId} not found`);
    }

    // Verify the approver is authorized
    if (!approval.isApprovedBy(approverId)) {
      throw new Error(
        "You are not authorized to approve this approval request"
      );
    }

    // Check if approval can be approved (must be pending)
    if (!ApprovalChainService.canApprove(approval)) {
      throw new Error(
        `Cannot approve: approval status is ${approval.status.toString()}, expected pending`
      );
    }

    const comments = command.comments
      ? ApprovalComments.create(command.comments)
      : undefined;

    // Approve current approval
    approval.approve(comments);
    await this.approvalCommandRepo.save(approval);

    // Get all approvals for this expense to find the next one
    const expenseId = approval.expenseId;
    const allApprovalsForExpense = await this.approvalQueryRepo.findByExpenseId(
      expenseId
    );

    // Find and activate the next approval in the chain
    const nextApproval = ApprovalChainService.findNextApproval(
      approval.approvalOrder.getValue(),
      allApprovalsForExpense
    );

    if (nextApproval && ApprovalChainService.canActivate(nextApproval)) {
      // Activate the next approval (change from WAITING to PENDING)
      nextApproval.activate();
      await this.approvalCommandRepo.save(nextApproval);
    } else if (!nextApproval) {
      // No next approval - this was the final approval
      // Mark expense as approved
      if (this.expenseOrchestrationService) {
        try {
          const expenseResult =
            await this.expenseOrchestrationService.markExpenseAsApproved(
              expenseId.getValue()
            );

          if (!expenseResult.success) {
            console.error(
              `Failed to mark expense as approved: ${expenseResult.error}`
            );
          }
        } catch (error) {
          console.error(`Error marking expense as approved:`, error);
        }
      }

      // Automatically create Purchase Order if service is available
      if (this.purchaseOrderOrchestrationService) {
        try {
          const poResult =
            await this.purchaseOrderOrchestrationService.createPurchaseOrderFromExpense(
              expenseId.getValue()
            );

          if (poResult.success && poResult.purchaseOrderId) {
            return {
              success: true,
              approvalId: approval.id.getValue(),
              purchaseOrderCreated: true,
              purchaseOrderId: poResult.purchaseOrderId,
            };
          } else {
            // PO creation failed but approval succeeded
            console.error(
              `Failed to create PO after final approval: ${poResult.error}`
            );
          }
        } catch (error) {
          // Log error but don't fail the approval
          console.error(`Error creating PO after final approval:`, error);
        }
      }
    }

    return {
      success: true,
      approvalId: approval.id.getValue(),
      purchaseOrderCreated: false,
    };
  }
}
