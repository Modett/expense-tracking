import type { IApprovalQueryRepository } from "../../../domain/repositories/IApprovalQueryRepository.js";
import type { GetRejectedApprovalsVisibleToRoleQuery } from "./query.js";

export interface RejectedApprovalInfo {
  expenseId: string;
  expenseDescription: string;
  expenseAmount: number;
  submittedBy: string;
  submittedAt: Date;
  rejectedBy: string;
  rejectedByRole: string;
  rejectedAt: Date;
  rejectionReason: string;
  approvalOrder: number; // Which level rejected it
  departmentId: string | null;
  categoryId: string;
  priority: string;
  budgetOverride: string;
}

export interface RejectedApprovalsResponse {
  rejectedApprovals: RejectedApprovalInfo[];
  total: number;
  summary: {
    totalRejected: number;
    byRole: Record<string, number>; // Count by rejecting role
    byDepartment: Record<string, number>;
    topRejectionReasons: { reason: string; count: number }[];
  };
}

/**
 * Handler for getting rejected approvals visible to higher roles
 *
 * Role Hierarchy:
 * - Staff (1) < Manager (2) < Finance (3) < Admin (4)
 *
 * Visibility Rules:
 * - Staff/Manager: Can see their own rejections
 * - Finance: Can see manager rejections + their own
 * - Admin: Can see all rejections (manager, finance) + their own
 */
export class GetRejectedApprovalsVisibleToRoleQueryHandler {
  constructor(
    private readonly approvalQueryRepo: IApprovalQueryRepository
  ) {}

  async handle(
    query: GetRejectedApprovalsVisibleToRoleQuery
  ): Promise<RejectedApprovalsResponse> {
    // Determine role hierarchy level
    const roleLevel = this.getRoleLevel(query.userRole);

    // Build base filters
    const filters: any = {
      limit: query.filters?.limit || 50,
      offset: query.filters?.offset || 0,
    };

    if (query.filters?.departmentId) filters.departmentId = query.filters.departmentId;
    if (query.filters?.categoryId) filters.categoryId = query.filters.categoryId;
    if (query.filters?.dateFrom) filters.dateFrom = query.filters.dateFrom;
    if (query.filters?.dateTo) filters.dateTo = query.filters.dateTo;
    if (query.filters?.rejectedByRole) filters.rejectedByRole = query.filters.rejectedByRole;

    // Role-based filtering:
    // - Staff (1): Can only see their own rejections
    // - Manager (2): Can see their own rejections
    // - Finance (3): Can see manager rejections + their own
    // - Admin (4): Can see all rejections (manager, finance)

    if (roleLevel <= 2) {
      // Staff and Manager: Only see rejections they made
      filters.rejectedByUserId = query.userId;
    } else {
      // Finance and Admin: See rejections at lower levels
      filters.maxApprovalOrder = roleLevel - 1;
    }

    const rejectedApprovals = await this.approvalQueryRepo.findRejectedApprovals(filters);

    // Calculate summary statistics
    const summary = this.calculateSummary(rejectedApprovals);

    return {
      rejectedApprovals: rejectedApprovals.map((a) => this.mapToInfo(a)),
      total: rejectedApprovals.length,
      summary,
    };
  }

  private getRoleLevel(role: string): number {
    const levels: Record<string, number> = {
      staff: 1,
      manager: 2,
      finance: 3,
      admin: 4,
    };
    return levels[role.toLowerCase()] || 1;
  }

  private mapToInfo(approval: any): RejectedApprovalInfo {
    return {
      expenseId: approval.expenseId,
      expenseDescription: approval.expense?.description || "N/A",
      expenseAmount: approval.expense?.totalAmount || 0,
      submittedBy: approval.expense?.userId || "N/A",
      submittedAt: approval.expense?.createdAt || new Date(),
      rejectedBy: approval.approverId,
      rejectedByRole: approval.approver?.role || "unknown",
      rejectedAt: approval.approvedAt || new Date(),
      rejectionReason: approval.comments || "No reason provided",
      approvalOrder: approval.approvalOrder,
      departmentId: approval.expense?.departmentId || null,
      categoryId: approval.expense?.categoryId || "N/A",
      priority: approval.expense?.priority || "standard",
      budgetOverride: approval.expense?.budgetOverride || "none",
    };
  }

  private calculateSummary(approvals: any[]): {
    totalRejected: number;
    byRole: Record<string, number>;
    byDepartment: Record<string, number>;
    topRejectionReasons: { reason: string; count: number }[];
  } {
    const byRole: Record<string, number> = {};
    const byDepartment: Record<string, number> = {};
    const reasonCounts: Record<string, number> = {};

    for (const approval of approvals) {
      // Count by role
      const role = approval.approver?.role || "unknown";
      byRole[role] = (byRole[role] || 0) + 1;

      // Count by department
      const dept = approval.expense?.departmentId || "unassigned";
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;

      // Count rejection reasons
      const reason = approval.comments || "No reason provided";
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    }

    // Get top 5 rejection reasons
    const topRejectionReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRejected: approvals.length,
      byRole,
      byDepartment,
      topRejectionReasons,
    };
  }
}
