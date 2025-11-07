export class ApproveExpenseCommand {
  constructor(
    public readonly expenseId: string,
    public readonly approverId: string,
    public readonly approvalNotes?: string
  ) {}
}
