export class GetAllApprovalsQuery {
  constructor(
    public readonly expenseId?: string,
    public readonly approverId?: string,
    public readonly status?: string,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date
  ) {}
}
