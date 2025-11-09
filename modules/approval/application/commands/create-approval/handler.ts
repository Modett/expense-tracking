import type { IApprovalCommandRepository } from "../../../domain/repositories/IApprovalCommandRepository.js";
import {
  Approval,
  ExpenseId,
  UserId,
  ApprovalComments,
  ApprovalOrder,
  ApprovalChainService,
} from "../../../domain/index.js";
import type { CreateApprovalCommand } from "./command.js";

export interface CreateApprovalResponse {
  success: boolean;
  approvalId: string;
}

export class CreateApprovalCommandHandler {
  constructor(
    private readonly approvalCommandRepo: IApprovalCommandRepository
  ) {}

  async handle(
    command: CreateApprovalCommand
  ): Promise<CreateApprovalResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);
    const approverId = UserId.fromString(command.approverId);
    const approvalOrder = ApprovalOrder.create(command.approvalOrder);
    const comments = command.comments
      ? ApprovalComments.create(command.comments)
      : undefined;

    // Determine initial status based on approval order
    const status = ApprovalChainService.getInitialStatus(command.approvalOrder);

    const approval = Approval.create({
      expenseId,
      approverId,
      approvalOrder,
      status,
      ...(comments && { comments }),
    });

    await this.approvalCommandRepo.save(approval);

    return {
      success: true,
      approvalId: approval.id.getValue(),
    };
  }
}
