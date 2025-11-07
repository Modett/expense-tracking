export class CancelExpenseCommand {
  constructor(
    public readonly expenseId: string,
    public readonly cancelReason?: string
  ) {}
}
