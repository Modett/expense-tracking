export class CreateApprovalCommand {
  constructor(
    public readonly expenseId: string,
    public readonly approverId: string,
    public readonly comments?: string
  ) {}
}
