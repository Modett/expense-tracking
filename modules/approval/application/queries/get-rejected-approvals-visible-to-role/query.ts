/**
 * GetRejectedApprovalsVisibleToRoleQuery
 *
 * Returns expenses that were rejected at lower approval levels,
 * allowing higher roles to see what was rejected before reaching them.
 *
 * Use Cases:
 * - Finance can see expenses rejected by managers
 * - Admin can see expenses rejected by managers or finance
 * - Helps identify patterns, training needs, and potential issues
 */
export class GetRejectedApprovalsVisibleToRoleQuery {
  constructor(
    public readonly userId: string,
    public readonly userRole: string, // 'manager', 'finance', 'admin'
    public readonly filters?: {
      departmentId?: string;
      categoryId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      rejectedByRole?: string; // Filter by who rejected it
      limit?: number;
      offset?: number;
    }
  ) {}
}
