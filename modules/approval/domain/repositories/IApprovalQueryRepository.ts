import { Approval } from "../entities/Approval.js";
import {
  ApprovalId,
  ApprovalStatus,
  ExpenseId,
  UserId,
} from "../value-objects/index.js";

export interface ApprovalFilters {
  expenseId?: ExpenseId;
  approverId?: UserId;
  status?: ApprovalStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IApprovalQueryRepository {
  findById(approvalId: ApprovalId): Promise<Approval | null>;
  findByExpenseId(expenseId: ExpenseId): Promise<Approval[]>;
  findByApproverId(approverId: UserId): Promise<Approval[]>;
  findByStatus(status: ApprovalStatus): Promise<Approval[]>;
  findAll(filters?: ApprovalFilters): Promise<Approval[]>;
  findPendingApprovals(): Promise<Approval[]>;
  findPendingApprovalsByApproverId(approverId: UserId): Promise<Approval[]>;
  count(filters?: ApprovalFilters): Promise<number>;
}
