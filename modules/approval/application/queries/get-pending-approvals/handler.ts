import type { IApprovalQueryRepository } from "../../../domain/repositories/IApprovalQueryRepository.js";
import { UserId } from "../../../domain/index.js";
import type { GetPendingApprovalsQuery } from "./query.js";

export interface ApprovalDTO {
  id: string;
  expenseId: string;
  approverId: string;
  approvalOrder: number;
  status: string;
  comments: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  expense?: any;
  approver?: any;
}

export class GetPendingApprovalsQueryHandler {
  constructor(private readonly approvalQueryRepo: IApprovalQueryRepository) {}

  async handle(query: GetPendingApprovalsQuery): Promise<ApprovalDTO[]> {
    let approvals;

    if (query.approverId) {
      const approverId = UserId.fromString(query.approverId);
      approvals = await this.approvalQueryRepo.findPendingApprovalsByApproverId(
        approverId
      );
    } else {
      approvals = await this.approvalQueryRepo.findPendingApprovals();
    }

    return approvals.map((approval) => {
      const plainObject = approval.toPlainObject();
      return {
        ...plainObject,
        expense: (approval as any).expense,
        approver: (approval as any).approver,
      };
    });
  }
}
