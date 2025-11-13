// Export query classes individually
export { GetApprovalByIdQuery } from "./get-approval-by-id/query.js";
export { GetAllApprovalsQuery } from "./get-all-approvals/query.js";
export { GetPendingApprovalsQuery } from "./get-pending-approvals/query.js";
export { GetApprovalsByExpenseQuery } from "./get-approvals-by-expense/query.js";
export { GetApprovalsByApproverQuery } from "./get-approvals-by-approver/query.js";
export { GetRejectedApprovalsVisibleToRoleQuery } from "./get-rejected-approvals-visible-to-role/query.js";
export { GetRoleBasedDashboardQuery } from "./get-role-based-dashboard/query.js";

// Export handlers (only the classes, not duplicate DTOs)
export { GetApprovalByIdQueryHandler } from "./get-approval-by-id/handler.js";
export { GetAllApprovalsQueryHandler } from "./get-all-approvals/handler.js";
export { GetPendingApprovalsQueryHandler } from "./get-pending-approvals/handler.js";
export { GetApprovalsByExpenseQueryHandler } from "./get-approvals-by-expense/handler.js";
export { GetApprovalsByApproverQueryHandler } from "./get-approvals-by-approver/handler.js";
export { GetRejectedApprovalsVisibleToRoleQueryHandler } from "./get-rejected-approvals-visible-to-role/handler.js";
export { GetRoleBasedDashboardQueryHandler } from "./get-role-based-dashboard/handler.js";

// Export a single ApprovalDTO to avoid conflicts
export type { ApprovalDTO } from "./get-approval-by-id/handler.js";
