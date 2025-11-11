import type { IApprovalCommandRepository } from "../../../domain/repositories/IApprovalCommandRepository.js";
import type { IApprovalQueryRepository } from "../../../domain/repositories/IApprovalQueryRepository.js";
import {
  ApprovalId,
  UserId,
  ApprovalComments,
  ApprovalChainService,
} from "../../../domain/index.js";
import type { ApproveApprovalCommand } from "./command.js";
import type { ExpenseOrchestrationService } from "../../../../expense-management/application/services/ExpenseOrchestrationService.js";

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

    if (!approval.isApprovedBy(approverId)) {
      throw new Error(
        "You are not authorized to approve this approval request"
      );
    }

    if (!ApprovalChainService.canApprove(approval)) {
      throw new Error(
        `Cannot approve: approval status is ${approval.status.toString()}, expected pending`
      );
    }

    const comments = command.comments
      ? ApprovalComments.create(command.comments)
      : undefined;

    approval.approve(comments);
    await this.approvalCommandRepo.save(approval);

    const expenseId = approval.expenseId;
    const allApprovalsForExpense = await this.approvalQueryRepo.findByExpenseId(
      expenseId
    );

    const nextApproval = ApprovalChainService.findNextApproval(
      approval.approvalOrder.getValue(),
      allApprovalsForExpense
    );

    if (nextApproval && ApprovalChainService.canActivate(nextApproval)) {
      nextApproval.activate();
      await this.approvalCommandRepo.save(nextApproval);
    } else if (!nextApproval) {
      let purchaseOrderCreated = false;
      let purchaseOrderId: string | undefined;

      if (this.purchaseOrderOrchestrationService) {
        try {
          const poResult =
            await this.purchaseOrderOrchestrationService.createPurchaseOrderFromExpense(
              expenseId.getValue()
            );

          if (poResult.success && poResult.purchaseOrderId) {
            purchaseOrderCreated = true;
            purchaseOrderId = poResult.purchaseOrderId;
          } else {
            console.error(
              `Failed to create PO after final approval: ${poResult.error}`
            );
          }
        } catch (error) {
          console.error(`Error creating PO after final approval:`, error);
        }
      }

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

      if (purchaseOrderCreated && purchaseOrderId) {
        return {
          success: true,
          approvalId: approval.id.getValue(),
          purchaseOrderCreated: true,
          purchaseOrderId: purchaseOrderId,
        };
      }
    }

    return {
      success: true,
      approvalId: approval.id.getValue(),
      purchaseOrderCreated: false,
    };
  }
}
