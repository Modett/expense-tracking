/**
 * GetRoleBasedDashboardQuery
 *
 * Returns a role-specific dashboard view with:
 * - Pending approvals for this role
 * - Recently approved/rejected by this user
 * - Expenses awaiting higher-level approval (read-only preview)
 * - Expenses rejected at lower levels (for learning/oversight)
 * - Budget alerts relevant to this role
 */
export class GetRoleBasedDashboardQuery {
  constructor(
    public readonly userId: string,
    public readonly userRole: string // 'manager', 'finance', 'admin'
  ) {}
}
