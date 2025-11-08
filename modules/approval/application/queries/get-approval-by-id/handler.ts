import type { IApprovalQueryRepository } from "../../../domain/repositories/IApprovalQueryRepository.js";
import { ApprovalId } from "../../../domain/index.js";
import type { GetApprovalByIdQuery } from "./query.js";

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

export class GetApprovalByIdQueryHandler {
  constructor(
    private readonly approvalQueryRepo: IApprovalQueryRepository
  ) {}

  async handle(query: GetApprovalByIdQuery): Promise<ApprovalDTO | null> {
    const approvalId = ApprovalId.fromString(query.approvalId);

    const approval = await this.approvalQueryRepo.findById(approvalId);

    if (!approval) {
      return null;
    }

    return approval.toPlainObject();
  }
}
