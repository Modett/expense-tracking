export class GetAllExpensesQuery {
  constructor(
    public readonly userId?: string,
    public readonly status?: string,
    public readonly categoryId?: string,
    public readonly departmentId?: string,
    public readonly vendorId?: string,
    public readonly fromDate?: Date,
    public readonly toDate?: Date,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly sortBy?: string,
    public readonly sortOrder?: "asc" | "desc"
  ) {}
}
