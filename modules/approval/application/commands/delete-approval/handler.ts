import type { IApprovalCommandRepository } from "../../../domain/repositories/IApprovalCommandRepository.js";
import type { IApprovalQueryRepository } from "../../../domain/repositories/IApprovalQueryRepository.js";
import { ApprovalId } from "../../../domain/index.js";
import type { DeleteApprovalCommand } from "./command.js";

export interface DeleteApprovalResponse {
  success: boolean;
}

export class DeleteApprovalCommandHandler {
  constructor(
    private readonly approvalQueryRepo: IApprovalQueryRepository,
    private readonly approvalCommandRepo: IApprovalCommandRepository
  ) {}

  async handle(
    command: DeleteApprovalCommand
  ): Promise<DeleteApprovalResponse> {
    const approvalId = ApprovalId.fromString(command.approvalId);

    const approval = await this.approvalQueryRepo.findById(approvalId);
    if (!approval) {
      throw new Error(`Approval with ID ${command.approvalId} not found`);
    }

    // Only allow deletion of pending approvals
    if (!approval.isPending()) {
      throw new Error(
        `Cannot delete approval: status is ${approval.status.toString()}`
      );
    }

    await this.approvalCommandRepo.delete(approvalId);

    return {
      success: true,
    };
  }
}
