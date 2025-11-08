import type { IApprovalQueryRepository, ApprovalFilters } from "../../../domain/repositories/IApprovalQueryRepository.js";
import { ExpenseId, UserId, ApprovalStatus } from "../../../domain/index.js";
import type { GetAllApprovalsQuery } from "./query.js";

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

export class GetAllApprovalsQueryHandler {
  constructor(
    private readonly approvalQueryRepo: IApprovalQueryRepository
  ) {}

  async handle(query: GetAllApprovalsQuery): Promise<ApprovalDTO[]> {
    const filters: ApprovalFilters = {};

    if (query.expenseId) {
      filters.expenseId = ExpenseId.fromString(query.expenseId);
    }

    if (query.approverId) {
      filters.approverId = UserId.fromString(query.approverId);
    }

    if (query.status) {
      filters.status = ApprovalStatus.fromString(query.status);
    }

    if (query.dateFrom) {
      filters.dateFrom = query.dateFrom;
    }

    if (query.dateTo) {
      filters.dateTo = query.dateTo;
    }

    const approvals = await this.approvalQueryRepo.findAll(filters);

    return approvals.map((approval) => approval.toPlainObject());
  }
}
