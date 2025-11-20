export class GetAllApprovalRulesQuery {
  constructor(
    public readonly categoryId?: string,
    public readonly departmentId?: string,
    public readonly approverRole?: string,
    public readonly isActive?: boolean,
    public readonly minAmountGreaterThan?: number,
    public readonly minAmountLessThan?: number
  ) {}
}
