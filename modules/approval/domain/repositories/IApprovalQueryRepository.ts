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

export interface RejectedApprovalFilters {
  maxApprovalOrder?: number;
  departmentId?: string;
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  rejectedByRole?: string;
  rejectedByUserId?: string; // Filter by the user who rejected (for managers/staff to see their own rejections)
  limit?: number;
  offset?: number;
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

  // Advanced query methods for dashboard and rejection visibility
  findPendingForUser(userId: string): Promise<any[]>;
  findApprovedByUserSince(userId: string, since: Date): Promise<any[]>;
  findRejectedByUserSince(userId: string, since: Date): Promise<any[]>;
  findAwaitingHigherLevel(userId: string, roleLevel: number): Promise<any[]>;
  findRejectedBeforeLevel(roleLevel: number): Promise<any[]>;
  findRejectedApprovals(filters: RejectedApprovalFilters): Promise<any[]>;
}
