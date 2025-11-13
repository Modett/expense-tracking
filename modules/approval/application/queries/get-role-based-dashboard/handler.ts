import type { IApprovalQueryRepository } from "../../../domain/repositories/IApprovalQueryRepository.js";
import type { GetRoleBasedDashboardQuery } from "./query.js";

export interface DashboardApproval {
  approvalId: string;
  expenseId: string;
  expenseDescription: string;
  expenseAmount: number;
  submittedBy: string;
  submittedAt: Date;
  approvalOrder: number;
  status: string;
  priority: string;
  approvalDeadline?: Date | undefined;
  daysUntilDeadline?: number | undefined;
  budgetStatus?: "within" | "warning" | "exceeded" | undefined;
}

export interface RoleBasedDashboardResponse {
  // Section 1: My Pending Approvals (Action Required)
  myPendingApprovals: DashboardApproval[];
  pendingCount: number;
  urgentCount: number; // Approvals with <24h deadline

  // Section 2: My Recent Activity
  recentlyApproved: DashboardApproval[];
  recentlyRejected: DashboardApproval[];

  // Section 3: Awaiting Higher Level (Read-Only Preview)
  awaitingHigherLevel: DashboardApproval[];

  // Section 4: Rejected at Lower Levels (Oversight/Learning)
  rejectedAtLowerLevels: DashboardApproval[];

  // Section 5: Summary Stats
  summary: {
    totalPending: number;
    totalApprovedThisWeek: number;
    totalRejectedThisWeek: number;
    averageApprovalTime: number; // in hours
    oldestPendingDays: number;
  };
}

/**
 * Role-Based Dashboard Handler
 *
 * Provides personalized dashboard based on user's role and responsibilities
 */
export class GetRoleBasedDashboardQueryHandler {
  constructor(
    private readonly approvalQueryRepo: IApprovalQueryRepository
  ) {}

  async handle(
    query: GetRoleBasedDashboardQuery
  ): Promise<RoleBasedDashboardResponse> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Section 1: Get pending approvals for this user
    const myPendingApprovals = await this.approvalQueryRepo.findPendingForUser(
      query.userId
    );

    // Section 2: Get recent approvals/rejections by this user
    const recentlyApproved =
      await this.approvalQueryRepo.findApprovedByUserSince(
        query.userId,
        oneWeekAgo
      );

    const recentlyRejected =
      await this.approvalQueryRepo.findRejectedByUserSince(
        query.userId,
        oneWeekAgo
      );

    // Section 3: Get expenses waiting for higher approval
    // (expenses that this user approved, but still need more approvals)
    const roleLevel = this.getRoleLevel(query.userRole);
    const awaitingHigherLevel =
      await this.approvalQueryRepo.findAwaitingHigherLevel(
        query.userId,
        roleLevel
      );

    // Section 4: Get rejections at lower levels (for oversight)
    const rejectedAtLowerLevels =
      roleLevel > 2
        ? await this.approvalQueryRepo.findRejectedBeforeLevel(roleLevel)
        : [];

    // Calculate summary statistics
    const summary = this.calculateSummary(
      myPendingApprovals,
      recentlyApproved,
      recentlyRejected
    );

    // Count urgent approvals (deadline < 24h)
    const urgentCount = myPendingApprovals.filter((a) => {
      if (!a.expense?.approvalDeadline) return false;
      const hoursUntilDeadline =
        (a.expense.approvalDeadline.getTime() - now.getTime()) /
        (1000 * 60 * 60);
      return hoursUntilDeadline < 24 && hoursUntilDeadline > 0;
    }).length;

    return {
      myPendingApprovals: myPendingApprovals.map((a) =>
        this.mapToDashboardApproval(a)
      ),
      pendingCount: myPendingApprovals.length,
      urgentCount,
      recentlyApproved: recentlyApproved
        .map((a) => this.mapToDashboardApproval(a))
        .slice(0, 10),
      recentlyRejected: recentlyRejected
        .map((a) => this.mapToDashboardApproval(a))
        .slice(0, 10),
      awaitingHigherLevel: awaitingHigherLevel
        .map((a) => this.mapToDashboardApproval(a))
        .slice(0, 10),
      rejectedAtLowerLevels: rejectedAtLowerLevels
        .map((a) => this.mapToDashboardApproval(a))
        .slice(0, 10),
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

  private mapToDashboardApproval(approval: any): DashboardApproval {
    const now = new Date();
    const deadline = approval.expense?.approvalDeadline;
    let daysUntilDeadline: number | undefined;

    if (deadline) {
      const msUntilDeadline = deadline.getTime() - now.getTime();
      daysUntilDeadline = Math.ceil(msUntilDeadline / (1000 * 60 * 60 * 24));
    }

    return {
      approvalId: approval.id || approval.approvalId,
      expenseId: approval.expenseId,
      expenseDescription: approval.expense?.description || "N/A",
      expenseAmount: approval.expense?.totalAmount || 0,
      submittedBy: approval.expense?.userId || "N/A",
      submittedAt: approval.createdAt || new Date(),
      approvalOrder: approval.approvalOrder || 1,
      status: approval.status || "pending",
      priority: approval.expense?.priority || "standard",
      approvalDeadline: deadline,
      daysUntilDeadline,
      budgetStatus: this.determineBudgetStatus(approval.expense),
    };
  }

  private determineBudgetStatus(
    expense: any
  ): "within" | "warning" | "exceeded" {
    const budgetOverride = expense?.budgetOverride;
    if (budgetOverride && budgetOverride !== "none") {
      return "exceeded";
    }
    // Would need budget info to determine warning level
    // For now, assume within budget if no override
    return "within";
  }

  private calculateSummary(
    pending: any[],
    approved: any[],
    rejected: any[]
  ): {
    totalPending: number;
    totalApprovedThisWeek: number;
    totalRejectedThisWeek: number;
    averageApprovalTime: number;
    oldestPendingDays: number;
  } {
    // Calculate average approval time
    const approvalTimes = approved
      .filter((a) => a.approvedAt && a.createdAt)
      .map(
        (a) =>
          (a.approvedAt.getTime() - a.createdAt.getTime()) / (1000 * 60 * 60)
      ); // hours

    const averageApprovalTime =
      approvalTimes.length > 0
        ? approvalTimes.reduce((sum, time) => sum + time, 0) /
          approvalTimes.length
        : 0;

    // Find oldest pending
    const oldestPending = pending.reduce((oldest, current) => {
      if (!oldest) return current;
      return current.createdAt < oldest.createdAt ? current : oldest;
    }, null);

    const oldestPendingDays = oldestPending
      ? Math.ceil(
          (Date.now() - oldestPending.createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    return {
      totalPending: pending.length,
      totalApprovedThisWeek: approved.length,
      totalRejectedThisWeek: rejected.length,
      averageApprovalTime: Math.round(averageApprovalTime * 10) / 10,
      oldestPendingDays,
    };
  }
}
