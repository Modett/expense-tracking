import type { IApprovalCommandRepository } from "../../../domain/repositories/IApprovalCommandRepository.js";
import {
  Approval,
  ExpenseId,
  UserId,
  ApprovalComments,
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
    const comments = command.comments
      ? ApprovalComments.create(command.comments)
      : undefined;

    const approval = Approval.create({
      expenseId,
      approverId,
      comments,
    });

    await this.approvalCommandRepo.save(approval);

    return {
      success: true,
      approvalId: approval.id.getValue(),
    };
  }
}
