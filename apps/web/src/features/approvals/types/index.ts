export enum ApprovalStatusEnum {
  WAITING = "WAITING",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SKIPPED = "SKIPPED",
}

export enum ApproverRoleEnum {
  STAFF = "STAFF",
  MANAGER = "MANAGER",
  FINANCE = "FINANCE",
  ADMIN = "ADMIN",
}

export interface Approval {
  approvalId: string;
  expenseId: string;
  approverId: string;
  approvalOrder: number;
  status: ApprovalStatusEnum;
  comments?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  expense?: {
    expenseId: string;
    description: string;
    amountNet: number;
    taxAmount: number;
    totalAmount: number;
    status: string;
    priority: string;
    dateOfExpense: string;
    user?: {
      userId: string;
      name: string;
      email: string;
    };
    vendor?: {
      vendorId: string;
      name: string;
    };
    category?: {
      categoryId: string;
      name: string;
    };
  };
  approver?: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface DashboardApproval {
  approvalId: string;
  expenseId: string;
  expenseDescription: string;
  expenseAmount: number;
  submittedBy: string;
  submittedAt: string;
  approvalOrder: number;
  status: string;
  priority: string;
  approvalDeadline?: string | null;
  daysUntilDeadline?: number | null;
  budgetStatus?: "within" | "warning" | "exceeded";
}

export interface ApprovalDashboardData {
  myPendingApprovals: DashboardApproval[];
  pendingCount: number;
  urgentCount: number;
  recentlyApproved: DashboardApproval[];
  recentlyRejected: DashboardApproval[];
  awaitingHigherLevel: DashboardApproval[];
  rejectedAtLowerLevels: DashboardApproval[];
  summary: {
    totalPending: number;
    totalApprovedThisWeek: number;
    totalRejectedThisWeek: number;
    averageApprovalTime: number;
    oldestPendingDays: number;
  };
}

export interface ApproveApprovalRequest {
  comments?: string;
}

export interface RejectApprovalRequest {
  comments?: string;
}

export interface UpdateApprovalRequest {
  comments: string;
}

export interface ApproveApprovalResponse {
  success: boolean;
  approvalId: string;
  purchaseOrderCreated?: boolean;
  purchaseOrderId?: string;
}

export interface RejectApprovalResponse {
  success: boolean;
  approvalId: string;
}

export interface GetAllApprovalsParams {
  expenseId?: string;
  approverId?: string;
  status?: ApprovalStatusEnum;
  dateFrom?: string;
  dateTo?: string;
}

export interface RejectedApprovalData {
  approvalId: string;
  expenseId: string;
  expenseDescription: string;
  expenseAmount: number;
  submittedBy: string;
  rejectedBy: string;
  rejectedByRole: string;
  rejectedAt: string;
  comments?: string;
  departmentName?: string;
  categoryName?: string;
}

export interface GetRejectedApprovalsParams {
  departmentId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  rejectedByRole?: string;
  limit?: number;
  offset?: number;
}
