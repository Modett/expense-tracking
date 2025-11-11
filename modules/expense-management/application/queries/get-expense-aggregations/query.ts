export class GetExpenseAggregationsQuery {
  constructor(
    public readonly status?: string,
    public readonly userId?: string,
    public readonly vendorId?: string,
    public readonly categoryId?: string,
    public readonly departmentId?: string,
    public readonly dateFrom?: string,
    public readonly dateTo?: string,
    public readonly groupBy?: string[]
  ) {}
}
