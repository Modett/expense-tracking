import type { IApprovalQueryRepository } from "../../../domain/repositories/IApprovalQueryRepository.js";
import { ExpenseId } from "../../../domain/index.js";
import type { GetApprovalsByExpenseQuery } from "./query.js";

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

export class GetApprovalsByExpenseQueryHandler {
  constructor(
    private readonly approvalQueryRepo: IApprovalQueryRepository
  ) {}

  async handle(query: GetApprovalsByExpenseQuery): Promise<ApprovalDTO[]> {
    const expenseId = ExpenseId.fromString(query.expenseId);

    const approvals = await this.approvalQueryRepo.findByExpenseId(expenseId);

    return approvals.map((approval) => approval.toPlainObject());
  }
}
