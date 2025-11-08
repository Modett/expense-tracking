import type { IApprovalCommandRepository } from "../../../domain/repositories/IApprovalCommandRepository.js";
import type { IApprovalQueryRepository } from "../../../domain/repositories/IApprovalQueryRepository.js";
import { ApprovalId, ApprovalComments } from "../../../domain/index.js";
import type { UpdateApprovalCommand } from "./command.js";

export interface UpdateApprovalResponse {
  success: boolean;
  approvalId: string;
}

export class UpdateApprovalCommandHandler {
  constructor(
    private readonly approvalQueryRepo: IApprovalQueryRepository,
    private readonly approvalCommandRepo: IApprovalCommandRepository
  ) {}

  async handle(
    command: UpdateApprovalCommand
  ): Promise<UpdateApprovalResponse> {
    const approvalId = ApprovalId.fromString(command.approvalId);

    const approval = await this.approvalQueryRepo.findById(approvalId);
    if (!approval) {
      throw new Error(`Approval with ID ${command.approvalId} not found`);
    }

    const comments = ApprovalComments.create(command.comments);
    approval.updateComments(comments);

    await this.approvalCommandRepo.save(approval);

    return {
      success: true,
      approvalId: approval.id.getValue(),
    };
  }
}
