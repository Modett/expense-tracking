import type { IApprovalCommandRepository } from "../../../domain/repositories/IApprovalCommandRepository.js";
import type { IApprovalQueryRepository } from "../../../domain/repositories/IApprovalQueryRepository.js";
import {
  ApprovalId,
  UserId,
  ApprovalComments,
} from "../../../domain/index.js";
import type { RejectApprovalCommand } from "./command.js";

export interface RejectApprovalResponse {
  success: boolean;
  approvalId: string;
}

export class RejectApprovalCommandHandler {
  constructor(
    private readonly approvalQueryRepo: IApprovalQueryRepository,
    private readonly approvalCommandRepo: IApprovalCommandRepository
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
      throw new Error(
        "You are not authorized to reject this approval request"
      );
    }

    const comments = command.comments
      ? ApprovalComments.create(command.comments)
      : undefined;

    approval.reject(comments);

    await this.approvalCommandRepo.save(approval);

    return {
      success: true,
      approvalId: approval.id.getValue(),
    };
  }
}
