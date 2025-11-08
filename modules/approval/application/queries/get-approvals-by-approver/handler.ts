import type { IApprovalQueryRepository } from "../../../domain/repositories/IApprovalQueryRepository.js";
import { UserId } from "../../../domain/index.js";
import type { GetApprovalsByApproverQuery } from "./query.js";

export interface ApprovalDTO {
  id: string;
  expenseId: string;
  approverId: string;
  status: string;
  comments: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class GetApprovalsByApproverQueryHandler {
  constructor(
    private readonly approvalQueryRepo: IApprovalQueryRepository
  ) {}

  async handle(query: GetApprovalsByApproverQuery): Promise<ApprovalDTO[]> {
    const approverId = UserId.fromString(query.approverId);

    const approvals = await this.approvalQueryRepo.findByApproverId(
      approverId
    );

    return approvals.map((approval) => approval.toPlainObject());
  }
}
