export class RejectExpenseCommand {
  constructor(
    public readonly expenseId: string,
    public readonly rejectionReason: string,
    public readonly rejectedBy: string
  ) {}
}
