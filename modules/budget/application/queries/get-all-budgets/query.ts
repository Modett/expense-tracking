export class GetAllBudgetsQuery {
  constructor(
    public readonly departmentId?: string,
    public readonly categoryId?: string,
    public readonly fiscalPeriod?: string,
    public readonly isActive?: boolean,
    public readonly isOverBudget?: boolean,
    public readonly isNearLimit?: boolean
  ) {}
}
